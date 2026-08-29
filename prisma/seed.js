const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AskCET database...');

  // 1. Create Default Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@college.edu' },
    update: {},
    create: {
      email: 'admin@college.edu',
      passwordHash: adminPasswordHash,
      name: 'Dr. Sarah Connor (Admin)',
      role: 'ADMIN',
    },
  });

  // 2. Create Default Student User
  const studentPasswordHash = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@college.edu' },
    update: {},
    create: {
      email: 'student@college.edu',
      passwordHash: studentPasswordHash,
      name: 'Alex Johnson (Student)',
      role: 'STUDENT',
    },
  });

  console.log('✅ Created default users:');
  console.log(` - Admin: ${admin.email} (password: admin123)`);
  console.log(` - Student: ${student.email} (password: student123)`);

  // 3. Create Sample College Document & Chunks
  const doc = await prisma.document.upsert({
    where: { id: 'seed-academic-regulations-2026' },
    update: {},
    create: {
      id: 'seed-academic-regulations-2026',
      title: 'Academic Regulations & Student Policy 2026',
      fileName: 'Academic_Regulations_2026.pdf',
      filePath: '/uploads/Academic_Regulations_2026.pdf',
      fileType: 'pdf',
      category: 'Academics',
      department: 'General',
      version: 'v2026.1',
      status: 'INDEXED',
      uploadedById: admin.id,
    },
  });

  const sampleChunks = [
    {
      pageNumber: 14,
      chunkIndex: 0,
      content:
        'ACADEMIC ATTENDANCE POLICY (Section 4.2): All undergraduate and postgraduate students are required to maintain a minimum of 75% attendance in each registered course to be eligible to appear for the end-semester examinations. Condonation up to 10% may be granted by the Academic Dean on medical grounds.',
    },
    {
      pageNumber: 22,
      chunkIndex: 1,
      content:
        'HOSTEL TIMINGS AND DISCIPLINE (Section 8.1): All hostel resident students must return to the hostel premises by 9:00 PM on weekdays and 10:00 PM on weekends. Late entry requires prior written approval from the Warden.',
    },
    {
      pageNumber: 31,
      chunkIndex: 2,
      content:
        'EXAMINATION REGISTRATION DEADLINE (Section 11.4): Registration for end-semester examinations closes on 15 September 2026. A late fee of $25 per day will be applicable for registrations submitted between 16 September and 20 September 2026.',
    },
  ];

  for (const chunk of sampleChunks) {
    const existingChunk = await prisma.documentChunk.findFirst({
      where: { documentId: doc.id, chunkIndex: chunk.chunkIndex },
    });

    if (!existingChunk) {
      const hash = Array.from(chunk.content).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const vector = Array.from({ length: 768 }, (_, i) => Math.sin(hash + i) * 0.05);

      await prisma.documentChunk.create({
        data: {
          documentId: doc.id,
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          chunkIndex: chunk.chunkIndex,
          embedding: JSON.stringify(vector),
        },
      });
    }
  }

  console.log('✅ Seeded sample college handbook document & chunks successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
