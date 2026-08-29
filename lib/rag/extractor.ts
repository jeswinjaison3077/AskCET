import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedDocument {
  text: string;
  pages: ExtractedPage[];
}

/**
 * Extracts structured text and page content from PDF, DOCX, TXT, or MD file buffers.
 */
export async function extractDocumentText(
  fileBuffer: Buffer,
  fileType: string
): Promise<ExtractedDocument> {
  const normalizedType = fileType.toLowerCase();

  if (normalizedType === 'pdf' || normalizedType === 'application/pdf') {
    const data = await pdfParse(fileBuffer);
    
    // Page splitting heuristic if page info available
    const pageTexts = data.text.split(/\f|\n(?=Page \d+)/i);
    const pages: ExtractedPage[] = pageTexts.map((text, idx) => ({
      pageNumber: idx + 1,
      text: text.trim(),
    })).filter(p => p.text.length > 0);

    return {
      text: data.text,
      pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: data.text.trim() }],
    };
  }

  if (
    normalizedType === 'docx' ||
    normalizedType === 'doc' ||
    normalizedType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const fullText = result.value.trim();
    const sections = fullText.split(/\n\s*\n/);
    const pages: ExtractedPage[] = sections.map((sec, idx) => ({
      pageNumber: Math.floor(idx / 3) + 1,
      text: sec.trim(),
    })).filter(p => p.text.length > 0);

    return {
      text: fullText,
      pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: fullText }],
    };
  }

  if (
    normalizedType === 'txt' ||
    normalizedType === 'text/plain' ||
    normalizedType === 'md' ||
    normalizedType === 'markdown' ||
    normalizedType === 'text/markdown'
  ) {
    const fullText = fileBuffer.toString('utf-8').trim();
    // Split markdown headers into separate page chunks if available
    const sections = fullText.split(/(?=\n#+ )/);
    const pages: ExtractedPage[] = sections.map((sec, idx) => ({
      pageNumber: idx + 1,
      text: sec.trim(),
    })).filter(p => p.text.length > 0);

    return {
      text: fullText,
      pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: fullText }],
    };
  }

  throw new Error(`Unsupported file type: ${fileType}. Allowed types are PDF, DOCX, TXT, and MD.`);
}
