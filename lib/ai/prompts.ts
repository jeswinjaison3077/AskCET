export interface RAGContextChunk {
  documentTitle: string;
  category: string;
  department: string;
  pageNumber: number;
  content: string;
}

/**
 * Builds system prompt instructing Gemini to answer grounded strictly in retrieved context.
 */
export function buildRAGSystemPrompt(chunks: RAGContextChunk[], userQuery: string, language: string = 'English'): string {
  const languageInstruction =
    language === 'Malayalam'
      ? 'CRITICAL LANGUAGE INSTRUCTION: Answer the student question in fluent, natural MALAYALAM (മലയാളം). Retain official document titles and numbers in English.'
      : language === 'Hindi'
      ? 'CRITICAL LANGUAGE INSTRUCTION: Answer the student question in fluent, natural HINDI (हिंदी). Retain official document titles and numbers in English.'
      : 'Answer in clear, professional English.';

  if (!chunks || chunks.length === 0) {
    return `You are AskCET, the official AI-powered College Information Assistant.
The user is asking: "${userQuery}"

No relevant college documentation could be retrieved for this query.

Instructions:
1. State clearly and politely that you could not find reliable information about this topic in official college documents.
2. ${languageInstruction}
3. Advise the student to contact the concerned department, academic desk, or college administration directly.
4. Do NOT invent, assume, or hallucinate facts or policies.`;
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

  return `You are AskCET, the official AI-powered College Information Assistant.
${languageInstruction}

=== RETRIEVED COLLEGE DOCUMENTATION ===
${contextText}
=== END OF CONTEXT ===

STUDENT QUESTION: "${userQuery}"

STRICT GROUNDING RULES:
1. Rely ONLY on the information given in the retrieved documentation above.
2. If the retrieved context does not contain enough information to answer the question accurately, explicitly state that complete information could not be found in official documents.
3. Do NOT invent dates, fee amounts, room rules, attendance percentages, or policies that are not stated in the context.
4. Structure your response clearly using markdown formatting (bullet points, bold text).
5. At the end of your response, list the reference sources used.`;
}
