import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { extractDocumentText } from '@/lib/rag/extractor';
import { chunkDocumentPages } from '@/lib/rag/chunker';
import { generateEmbedding } from '@/lib/ai/gemini';
import { storeChunkVector } from '@/lib/rag/vector-store';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Fetch documents error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    const formData = await request.formData();
    const isNotice = formData.get('isNotice') === 'true';

    // Handle Direct Notice / Circular Submission
    if (isNotice) {
      const title = (formData.get('title') as string) || 'Campus Notice';
      const noticeDate = (formData.get('noticeDate') as string) || new Date().toISOString().split('T')[0];
      const department = (formData.get('department') as string) || 'Academic Office';
      const category = (formData.get('category') as string) || 'Examinations';
      const noticeContent = (formData.get('noticeContent') as string) || '';

      if (!noticeContent.trim()) {
        return NextResponse.json({ error: 'Notice content is required.' }, { status: 400 });
      }

      const fullNoticeText = `[OFFICIAL CAMPUS NOTICE]\nTitle: ${title}\nDate: ${noticeDate}\nDepartment: ${department}\nCategory: ${category}\n\nNotice Content:\n${noticeContent.trim()}`;

      // Create Document record
      const docRecord = await prisma.document.create({
        data: {
          title: `Notice: ${title}`,
          fileName: `notice_${Date.now()}.txt`,
          filePath: `notice://${title.replace(/[^a-zA-Z0-9]/g, '_')}`,
          fileType: 'notice',
          category,
          department,
          version: `Date: ${noticeDate}`,
          status: 'PROCESSING',
          uploadedById: session.userId,
        },
      });

      try {
        const chunks = chunkDocumentPages([{ pageNumber: 1, text: fullNoticeText }], { maxChunkSize: 800, overlap: 150 });

        for (const chunk of chunks) {
          const embedding = await generateEmbedding(chunk.content);
          await storeChunkVector(
            docRecord.id,
            chunk.content,
            chunk.pageNumber,
            chunk.chunkIndex,
            embedding
          );
        }

        const updatedDoc = await prisma.document.update({
          where: { id: docRecord.id },
          data: { status: 'INDEXED' },
        });

        return NextResponse.json({
          success: true,
          document: updatedDoc,
          chunkCount: chunks.length,
        });
      } catch (err) {
        console.error('Notice indexing failure:', err);
        await prisma.document.update({
          where: { id: docRecord.id },
          data: { status: 'FAILED' },
        });
        return NextResponse.json({ error: 'Failed to index campus notice.' }, { status: 500 });
      }
    }

    // Handle File Upload (PDF, DOCX, TXT)
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || file?.name || 'Untitled Document';
    const category = (formData.get('category') as string) || 'General';
    const department = (formData.get('department') as string) || 'General';
    const version = (formData.get('version') as string) || 'v1.0';

    if (!file) {
      return NextResponse.json({ error: 'No document file uploaded.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExtension = path.extname(file.name).replace('.', '').toLowerCase();

    // 1. Save file locally
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const storedFileName = `${Date.now()}_${file.name}`;
    const filePath = path.join(uploadsDir, storedFileName);
    await fs.writeFile(filePath, buffer);

    // 2. Create Document record in DB with PENDING status
    const docRecord = await prisma.document.create({
      data: {
        title,
        fileName: file.name,
        filePath,
        fileType: fileExtension,
        category,
        department,
        version,
        status: 'PROCESSING',
        uploadedById: session.userId,
      },
    });

    // 3. Extract text content & chunk pages
    try {
      const extracted = await extractDocumentText(buffer, fileExtension);
      const chunks = chunkDocumentPages(extracted.pages, { maxChunkSize: 800, overlap: 150 });

      // 4. Generate embeddings & store vector chunks
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.content);
        await storeChunkVector(
          docRecord.id,
          chunk.content,
          chunk.pageNumber,
          chunk.chunkIndex,
          embedding
        );
      }

      // Mark document as INDEXED
      const updatedDoc = await prisma.document.update({
        where: { id: docRecord.id },
        data: { status: 'INDEXED' },
      });

      return NextResponse.json({
        success: true,
        document: updatedDoc,
        chunkCount: chunks.length,
      });
    } catch (ingestionError) {
      console.error('Ingestion failure:', ingestionError);
      await prisma.document.update({
        where: { id: docRecord.id },
        data: { status: 'FAILED' },
      });

      return NextResponse.json(
        { error: 'Failed to extract text or index document embeddings.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
