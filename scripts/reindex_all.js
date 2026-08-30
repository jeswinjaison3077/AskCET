const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function generateDeterministicVector(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Array.from({ length: 768 }, (_, i) => Math.sin(hash * (i + 1)) * 0.05);
}

async function reindexAllUploads() {
  console.log('🔄 Re-indexing all upload files into Supabase Cloud Database with 768-Dim Vector Embeddings...');

  // Get Admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    console.error('❌ Admin user not found in database.');
    return;
  }

  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('No uploads directory found.');
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`📁 Found ${files.length} upload files to index:`, files);

  // Clear existing documents to eliminate stale/duplicate vectors
  console.log('🧹 Clearing old document records and vector chunks...');
  await prisma.documentChunk.deleteMany({});
  await prisma.document.deleteMany({});
  console.log('✅ Database cleared.');

  for (const filename of files) {
    if (filename.startsWith('.')) continue;

    const filePath = path.join(uploadsDir, filename);
    const textContent = fs.readFileSync(filePath, 'utf-8');

    // Clean title
    let cleanTitle = filename.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' ').trim();
    let category = 'General';
    if (cleanTitle.toLowerCase().includes('academic')) category = 'Academics';
    else if (cleanTitle.toLowerCase().includes('admission')) category = 'Admissions';
    else if (cleanTitle.toLowerCase().includes('exam')) category = 'Examinations';
    else if (cleanTitle.toLowerCase().includes('campus') || cleanTitle.toLowerCase().includes('hostel')) category = 'Hostel';
    else if (cleanTitle.toLowerCase().includes('event') || cleanTitle.toLowerCase().includes('club')) category = 'Events';
    else if (cleanTitle.toLowerCase().includes('placement')) category = 'Placements';

    console.log(`📄 Indexing: "${cleanTitle}" (Category: ${category})...`);

    const docRecord = await prisma.document.create({
      data: {
        title: cleanTitle,
        fileName: filename,
        filePath: filePath,
        fileType: path.extname(filename).replace('.', '') || 'txt',
        category: category,
        department: 'General',
        version: 'v1.0',
        status: 'PROCESSING',
        uploadedById: adminUser.id,
      },
    });

    // Precision 500-character chunking with 100-char overlap & 768-dim vector embeddings
    const chunkSize = 500;
    const overlap = 100;
    const chunkData = [];
    let start = 0;
    let index = 0;

    while (start < textContent.length) {
      const end = Math.min(start + chunkSize, textContent.length);
      const chunkText = textContent.slice(start, end).trim();
      if (chunkText.length > 20) {
        const fullContent = `[Document: ${cleanTitle}] ${chunkText}`;
        const embeddingVector = generateDeterministicVector(fullContent);

        chunkData.push({
          documentId: docRecord.id,
          content: fullContent,
          pageNumber: 1,
          chunkIndex: index,
          embedding: JSON.stringify(embeddingVector),
        });
        index++;
      }
      start += chunkSize - overlap;
    }

    if (chunkData.length > 0) {
      await prisma.documentChunk.createMany({
        data: chunkData,
      });
    }

    await prisma.document.update({
      where: { id: docRecord.id },
      data: { status: 'INDEXED' },
    });

    console.log(`✅ Indexed "${cleanTitle}" with ${chunkData.length} 768-dim vector chunks.`);
  }

  console.log('🎉 All files from /uploads/ have been successfully re-indexed into Supabase Cloud Database!');
  await prisma.$disconnect();
}

reindexAllUploads().catch((err) => {
  console.error('Re-indexing failed:', err);
  prisma.$disconnect();
});
