import { generateEmbedding } from '../lib/ai/gemini';
import { searchSimilarChunks } from '../lib/rag/vector-store';
import { prisma } from '../lib/db/prisma';

interface TestQuery {
  query: string;
  expectedKeyword: string;
}

const TEST_QUERIES: TestQuery[] = [
  { query: 'What is the attendance percentage requirement?', expectedKeyword: '75%' },
  { query: 'What are the hostel gate entry timings?', expectedKeyword: '9:00 PM' },
  { query: 'When is the deadline for exam registration?', expectedKeyword: '15 September' },
];

async function evaluateRAG() {
  console.log('🧪 Starting AskCET RAG Retrieval Quality Evaluation...\n');

  let passed = 0;
  const startTime = Date.now();

  for (const test of TEST_QUERIES) {
    console.log(`🔍 Query: "${test.query}"`);
    const qStart = Date.now();
    const queryEmbedding = await generateEmbedding(test.query);
    const results = await searchSimilarChunks(queryEmbedding, 3, 0.2);
    const latency = Date.now() - qStart;

    const matched = results.some((r) => r.content.toLowerCase().includes(test.expectedKeyword.toLowerCase()));

    if (matched) {
      console.log(`   ✅ PASS (Latency: ${latency}ms | Similarity: ${(results[0]?.similarity * 100 || 0).toFixed(1)}%)`);
      console.log(`      Snippet: "${results[0]?.content.slice(0, 100)}..."\n`);
      passed++;
    } else {
      console.log(`   ❌ FAIL (Expected keyword: "${test.expectedKeyword}")\n`);
    }
  }

  const totalDuration = Date.now() - startTime;
  console.log('==================================================');
  console.log(`RAG Evaluation Summary: ${passed}/${TEST_QUERIES.length} Tests Passed`);
  console.log(`Total Duration: ${totalDuration}ms`);
  console.log('==================================================');

  await prisma.$disconnect();
}

evaluateRAG().catch((err) => {
  console.error('RAG Evaluation Error:', err);
  process.exit(1);
});
