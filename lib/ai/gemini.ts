import { GoogleGenerativeAI } from '@google/generative-ai';

export function getApiKey(): string {
  return (process.env.GEMINI_API_KEY || '').replace(/[\r\n\s]/g, '').trim();
}

export function isValidApiKey(key: string): boolean {
  const cleaned = key.replace(/[\r\n\s]/g, '').trim();
  return typeof cleaned === 'string' && (cleaned.startsWith('AIzaSy') || cleaned.startsWith('AQ.')) && cleaned.length > 15;
}

/**
 * Generate vector embedding for a given text snippet using Gemini API or deterministic fallback
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = getApiKey();

  if (!isValidApiKey(apiKey)) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return Array.from({ length: 768 }, (_, i) => Math.sin(hash * (i + 1)) * 0.05);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.EMBEDDING_MODEL || 'text-embedding-004';
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return Array.from({ length: 768 }, (_, i) => Math.sin(hash * (i + 1)) * 0.05);
  }
}

/**
 * Get configured Gemini Generative Model instance with Google Search Grounding for live web synthesis
 */
export function getChatModel() {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.LLM_MODEL || 'gemini-1.5-flash';
  
  return genAI.getGenerativeModel({
    model: modelName,
    tools: [{ googleSearch: {} }] as any,
    generationConfig: {
      temperature: 0.3,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });
}
