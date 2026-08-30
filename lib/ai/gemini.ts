import { GoogleGenerativeAI } from '@google/generative-ai';

export function getApiKey(): string {
  return (process.env.GEMINI_API_KEY || '').replace(/[\r\n\s]/g, '').trim();
}

export function isValidApiKey(key: string): boolean {
  const cleaned = key.replace(/[\r\n\s]/g, '').trim();
  return typeof cleaned === 'string' && cleaned.length > 10;
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
 * Get configured Gemini Generative Model instance (Gemini 3.5 Active Model for 100% Live AI Generation)
 */
export function getChatModel() {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.LLM_MODEL || 'gemini-3.5-flash';
  
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.4,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });
}
