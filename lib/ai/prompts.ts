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
    return `Student Question: "${userQuery}"

No relevant college documentation could be retrieved for this query.

Instructions:
1. State directly and politely that complete information regarding this topic could not be found in official college documents.
2. ${languageInstruction}
3. Advise the student to contact the concerned department or college administration directly.
4. Do NOT say "Hello I am AskCET" or add greeting intros. Jump directly to the answer.
5. Do NOT invent, assume, or hallucinate facts or policies.`;
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

  return `${languageInstruction}

=== RETRIEVED COLLEGE DOCUMENTATION ===
${contextText}
=== END OF CONTEXT ===

STUDENT QUESTION: "${userQuery}"

STRICT GROUNDING RULES:
1. Jump directly into answering the question. Do NOT include greetings like "Hello, I am AskCET".
2. Rely ONLY on the information given in the retrieved documentation above.
3. If the retrieved context does not contain enough information to answer the question accurately, explicitly state that complete information could not be found in official documents.
4. Do NOT invent dates, fee amounts, room rules, attendance percentages, or policies that are not stated in the context.
5. Structure your response clearly using clean markdown formatting (bullet points, bold text).
6. Do NOT append text lists of sources or references at the end of your response. The application UI handles displaying verified sources separately.`;
}
