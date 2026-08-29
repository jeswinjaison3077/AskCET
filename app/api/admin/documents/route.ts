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

    // Ensure session userId or default Admin exists in DB
    let validUserId = session?.userId || null;
    if (validUserId) {
      let dbUser = await prisma.user.findUnique({ where: { id: validUserId } });
      if (!dbUser) validUserId = null;
    }
    
    if (!validUserId) {
      const defaultAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (defaultAdmin) validUserId = defaultAdmin.id;
    }

    if (!validUserId) {
      return NextResponse.json({ error: 'No admin user found' }, { status: 400 });
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
          uploadedById: validUserId,
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
        return NextResponse.json({ error: 'Failed to index notice.' }, { status: 500 });
      }
    }

    // Handle File Upload Submission
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'General';
    const department = (formData.get('department') as string) || 'General';

    if (!file) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(uploadDir, safeFileName);
    await fs.writeFile(filePath, fileBuffer);

    const docRecord = await prisma.document.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        filePath: `/uploads/${safeFileName}`,
        fileType: ext,
        category,
        department,
        status: 'PROCESSING',
        uploadedById: validUserId,
      },
    });

    try {
      const extracted = await extractDocumentText(fileBuffer, ext);
      const chunks = chunkDocumentPages(extracted.pages, { maxChunkSize: 800, overlap: 150 });

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
    } catch (indexError) {
      console.error('File indexing error:', indexError);
      await prisma.document.update({
        where: { id: docRecord.id },
        data: { status: 'FAILED' },
      });
      return NextResponse.json({ error: 'Failed to process and index document.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Document POST handler error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
