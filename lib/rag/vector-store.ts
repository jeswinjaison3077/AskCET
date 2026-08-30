import { prisma } from '@/lib/db/prisma';

export interface SearchResultChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  category: string;
  department: string;
  pageNumber: number;
  content: string;
  similarity: number;
}

/**
 * Calculates Cosine Similarity between two numerical vector arrays
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Stores a chunk and its 768-dim vector embedding into database.
 */
export async function storeChunkVector(
  documentId: string,
  content: string,
  pageNumber: number,
  chunkIndex: number,
  embedding: number[]
): Promise<string> {
  const chunk = await prisma.documentChunk.create({
    data: {
      documentId,
      content,
      pageNumber,
      chunkIndex,
      embedding: JSON.stringify(embedding),
    },
  });

  return chunk.id;
}

const STOP_WORDS = new Set([
  'what', 'is', 'the', 'for', 'in', 'of', 'to', 'a', 'an', 'on', 'by', 'with',
  'your', 'was', 'searched', 'against', 'our', 'college', 'database', 'where',
  'how', 'when', 'which', 'who', 'does', 'can', 'should', 'would', 'could',
  'are', 'were', 'been', 'being', 'have', 'has', 'had', 'do', 'did', 'doing',
  'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while', 'about'
]);

/**
 * Executes Robust Topic-Intent Hybrid Retrieval
 */
export async function searchSimilarChunks(
  queryEmbedding: number[],
  topK: number = 5,
  similarityThreshold: number = 0.01,
  queryText: string = ''
): Promise<SearchResultChunk[]> {
  try {
    const chunks = await prisma.documentChunk.findMany({
      where: {
        document: {
          status: 'INDEXED',
        },
      },
      include: {
        document: true,
      },
    });

    const qLower = queryText.toLowerCase();
    const keywords = qLower
      .split(/\s+/)
      .map(w => w.replace(/[^a-z0-9]/g, ''))
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));

    const scored = chunks.map((chunk) => {
      let vec: number[] = [];
      try {
        if (chunk.embedding) {
          vec = JSON.parse(chunk.embedding);
        }
      } catch {
        vec = [];
      }

      let vecSimilarity = cosineSimilarity(queryEmbedding, vec);
      let keywordHits = 0;

      if (keywords.length > 0) {
        const textLower = `${chunk.document.title} ${chunk.document.category} ${chunk.document.department} ${chunk.content}`.toLowerCase();
        for (const kw of keywords) {
          if (textLower.includes(kw)) {
            keywordHits += 1;
          }
        }
      }

      const keywordScore = keywords.length > 0 ? (keywordHits / keywords.length) : 0;
      let finalSimilarity = vecSimilarity;

      if (keywordHits > 0) {
        finalSimilarity = Math.max(vecSimilarity * 0.4 + keywordScore * 0.6, keywordScore);
      }

      // Topic Intent Boosting
      let topicBoost = 0;
      const docTitleLower = chunk.document.title.toLowerCase();
      const docCategoryLower = chunk.document.category.toLowerCase();

      if (qLower.includes('hostel') || qLower.includes('curfew') || qLower.includes('mess') || qLower.includes('gate') || qLower.includes('warden')) {
        if (docTitleLower.includes('campus') || docCategoryLower.includes('hostel')) topicBoost += 0.6;
      }
      if (qLower.includes('scholarship') || qLower.includes('tfw') || qLower.includes('fee') || qLower.includes('stipend') || qLower.includes('grant')) {
        if (docTitleLower.includes('admission') || docTitleLower.includes('campus') || docCategoryLower.includes('fees') || docCategoryLower.includes('admissions')) topicBoost += 0.6;
      }
      if (qLower.includes('placement') || qLower.includes('recruiter') || qLower.includes('salary') || qLower.includes('package') || qLower.includes('lpa')) {
        if (docTitleLower.includes('placement') || docCategoryLower.includes('placements')) topicBoost += 0.7;
      }
      if (qLower.includes('cse') || qLower.includes('btech') || qLower.includes('curriculum') || qLower.includes('syllabus') || qLower.includes('course')) {
        if (docTitleLower.includes('curriculum') || docTitleLower.includes('cse')) topicBoost += 0.6;
      }
      if (qLower.includes('exam') || qLower.includes('revaluation') || qLower.includes('hall ticket') || qLower.includes('result')) {
        if (docTitleLower.includes('examination') || docCategoryLower.includes('examinations')) topicBoost += 0.6;
      }

      // Downweight generic "General" document when a specific topic is queried
      if (topicBoost > 0 && docTitleLower === 'general') {
        topicBoost -= 0.4;
      }

      finalSimilarity += topicBoost;

      return {
        chunkId: chunk.id,
        documentId: chunk.documentId,
        documentTitle: chunk.document.title,
        category: chunk.document.category,
        department: chunk.document.department,
        pageNumber: chunk.pageNumber,
        content: chunk.content,
        similarity: finalSimilarity,
      };
    });

    const sorted = scored.sort((a, b) => b.similarity - a.similarity);
    return sorted.slice(0, topK);
  } catch (error) {
    console.error('Vector similarity query failed:', error);
    return [];
  }
}
