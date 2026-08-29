import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generate 768-dimensional vector embedding for a given text snippet
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('GEMINI_API_KEY is not set. Generating fallback deterministic mock embedding.');
    // Generate deterministic 768-dim mock vector if API key is absent
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return Array.from({ length: 768 }, (_, i) => Math.sin(hash * (i + 1)) * 0.05);
  }

  try {
    const model = genAI.getGenerativeModel({ model: process.env.EMBEDDING_MODEL || 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding with Gemini API:', error);
    throw new Error('Failed to generate vector embedding from Gemini API.');
  }
}

/**
 * Get configured Gemini Generative Model instance
 */
export function getChatModel() {
  const modelName = process.env.LLM_MODEL || 'gemini-1.5-flash';
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2, // Low temperature for deterministic, grounded answers
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });
}
