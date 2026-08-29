import { ExtractedPage } from './extractor';

export interface ChunkItem {
  content: string;
  pageNumber: number;
  chunkIndex: number;
}

export interface ChunkOptions {
  maxChunkSize?: number; // Default 800 chars
  overlap?: number;      // Default 150 chars
}

/**
 * Splits document pages into overlapping semantic chunks for vector embedding.
 */
export function chunkDocumentPages(
  pages: ExtractedPage[],
  options: ChunkOptions = {}
): ChunkItem[] {
  const maxChunkSize = options.maxChunkSize || 800;
  const overlap = options.overlap || 150;

  const chunks: ChunkItem[] = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const text = page.text;
    if (!text || text.length === 0) continue;

    if (text.length <= maxChunkSize) {
      chunks.push({
        content: text,
        pageNumber: page.pageNumber,
        chunkIndex: globalChunkIndex++,
      });
      continue;
    }

    // Split text into sentences / paragraphs
    const paragraphs = text.split(/(?<=\.\s+|\n\n+)/);
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length <= maxChunkSize) {
        currentChunk += (currentChunk ? ' ' : '') + paragraph;
      } else {
        if (currentChunk.trim().length > 0) {
          chunks.push({
            content: currentChunk.trim(),
            pageNumber: page.pageNumber,
            chunkIndex: globalChunkIndex++,
          });
        }
        // Retain overlap from end of previous chunk
        const overlapText = currentChunk.slice(-overlap);
        currentChunk = overlapText + (overlapText ? ' ' : '') + paragraph;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        pageNumber: page.pageNumber,
        chunkIndex: globalChunkIndex++,
      });
    }
  }

  return chunks;
}
