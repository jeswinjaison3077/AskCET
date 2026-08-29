export interface RAGContextChunk {
  documentTitle: string;
  category: string;
  department: string;
  pageNumber: number;
  content: string;
}

/**
 * Builds system prompt instructing Gemini to answer grounded strictly in retrieved context or converse naturally.
 */
export function buildRAGSystemPrompt(chunks: RAGContextChunk[], userQuery: string, language: string = 'English'): string {
  const languageInstruction =
    language === 'Malayalam'
      ? 'CRITICAL LANGUAGE INSTRUCTION: Answer in fluent, natural MALAYALAM (മലയാളം). Retain official document titles and numbers in English.'
      : language === 'Hindi'
      ? 'CRITICAL LANGUAGE INSTRUCTION: Answer in fluent, natural HINDI (हिंदी). Retain official document titles and numbers in English.'
      : 'Answer in clear, helpful, professional English.';

  if (!chunks || chunks.length === 0) {
    return `You are AskCET, the intelligent College Information Assistant for CET College of Engineering.
Student Message: "${userQuery}"

No specific college document snippet was retrieved for this exact query.

Instructions:
1. ${languageInstruction}
2. If the student is greeting you (e.g. "hi", "hello", "good morning", "thanks"), respond warmly, politely, and conversationally.
3. If the student is asking a general question, answer helpfully and clearly using general knowledge.
4. If the student is asking for specific official college dates, fees, or rules that require official verification, advise them to check official notices or contact the concerned department desk.
5. Do NOT use double asterisks (**) around headings or text.
6. Keep responses clean, concise, and helpful.`;
  }

  const contextText = chunks
    .map(
      (c, idx) =>
        `--- CONTEXT SOURCE [${idx + 1}] ---
Document: "${c.documentTitle}" | Category: ${c.category} | Department: ${c.department} | Page: ${c.pageNumber}
Content:
${c.content}`
    )
    .join('\n\n');

  return `You are AskCET, the official AI-powered College Information Assistant for CET College of Engineering.
${languageInstruction}

=== RETRIEVED COLLEGE DOCUMENTATION ===
${contextText}
=== END OF CONTEXT ===

STUDENT QUESTION: "${userQuery}"

STRICT GROUNDING RULES:
1. Rely primarily on the information given in the retrieved documentation above.
2. If the student is engaging in normal conversation or greetings, respond naturally and helpfully.
3. If the student asks for official college policies not covered in the context, politely state that complete details can be checked with the concerned department desk.
4. Do NOT invent specific dates, fee amounts, or attendance percentages that are not stated in the context.
5. Structure your response clearly using bullet points and clean text formatting. Do NOT use double asterisks (**) around headings or text.
6. Do NOT append text lists of sources or references at the end of your response. The application UI handles displaying verified sources separately.`;
}
