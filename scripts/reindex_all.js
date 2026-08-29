const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function reindexAllUploads() {
  console.log('🔄 Fast Re-indexing all upload files into Supabase Cloud Database...');

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

  for (const filename of files) {
    if (filename.startsWith('.')) continue;

    const filePath = path.join(uploadsDir, filename);
    const textContent = fs.readFileSync(filePath, 'utf-8');

    // Clean title
    let cleanTitle = filename.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    let category = 'General';
    if (cleanTitle.toLowerCase().includes('academic')) category = 'Academics';
    else if (cleanTitle.toLowerCase().includes('admission')) category = 'Admissions';
    else if (cleanTitle.toLowerCase().includes('exam')) category = 'Examinations';
    else if (cleanTitle.toLowerCase().includes('campus') || cleanTitle.toLowerCase().includes('hostel')) category = 'Hostel';
    else if (cleanTitle.toLowerCase().includes('event') || cleanTitle.toLowerCase().includes('club')) category = 'Events';
    else if (cleanTitle.toLowerCase().includes('placement')) category = 'Placements';

    // Check if already indexed
    const existing = await prisma.document.findFirst({
      where: { title: cleanTitle },
    });

    if (existing) {
      console.log(`⏩ Skipping already indexed document: ${cleanTitle}`);
      continue;
    }

    console.log(`📄 Indexing: ${cleanTitle} (Category: ${category})...`);

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

    // Chunk text content into 800 char blocks
    const chunkSize = 800;
    const overlap = 150;
    const chunkData = [];
    let start = 0;
    let index = 0;

    while (start < textContent.length) {
      const end = Math.min(start + chunkSize, textContent.length);
      const chunkText = textContent.slice(start, end).trim();
      if (chunkText.length > 20) {
        chunkData.push({
          documentId: docRecord.id,
          content: chunkText,
          pageNumber: 1,
          chunkIndex: index,
        });
        index++;
      }
      start += chunkSize - overlap;
    }

    // High speed batch insertion
    if (chunkData.length > 0) {
      await prisma.documentChunk.createMany({
        data: chunkData,
      });
    }

    await prisma.document.update({
      where: { id: docRecord.id },
      data: { status: 'INDEXED' },
    });

    console.log(`✅ Fast-indexed ${cleanTitle} with ${chunkData.length} chunks.`);
  }

  console.log('🎉 All files from /uploads/ have been successfully indexed into Supabase Cloud Database!');
  await prisma.$disconnect();
}

reindexAllUploads().catch((err) => {
  console.error('Migration failed:', err);
  prisma.$disconnect();
});
