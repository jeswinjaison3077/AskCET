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
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
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

/**
 * Executes Hybrid Retrieval (Vector Cosine Similarity + Keyword Re-ranking)
 */
export async function searchSimilarChunks(
  queryEmbedding: number[],
  topK: number = 5,
  similarityThreshold: number = 0.3,
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

    const keywords = queryText.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    const scored = chunks.map((chunk) => {
      let vec: number[] = [];
      try {
        if (chunk.embedding) {
          vec = JSON.parse(chunk.embedding);
        }
      } catch {
        vec = [];
      }

      let similarity = cosineSimilarity(queryEmbedding, vec);

      // Keyword boost for hybrid search (spec.md section 12)
      if (keywords.length > 0) {
        const textLower = `${chunk.document.title} ${chunk.document.category} ${chunk.document.department} ${chunk.content}`.toLowerCase();
        let keywordHits = 0;
        for (const kw of keywords) {
          if (textLower.includes(kw)) {
            keywordHits += 1;
          }
        }
        const keywordScore = Math.min(keywordHits / keywords.length, 1.0) * 0.25;
        similarity = (similarity * 0.75) + keywordScore;
      }

      return {
        chunkId: chunk.id,
        documentId: chunk.documentId,
        documentTitle: chunk.document.title,
        category: chunk.document.category,
        department: chunk.document.department,
        pageNumber: chunk.pageNumber,
        content: chunk.content,
        similarity,
      };
    });

    return scored
      .filter((s) => s.similarity >= similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (error) {
    console.error('Vector similarity query failed:', error);
    return [];
  }
}
