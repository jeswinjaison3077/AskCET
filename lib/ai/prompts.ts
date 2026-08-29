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
    return `You are AskCET, the official AI-powered College Information Assistant for CET College of Engineering.
Student Message: "${userQuery}"

No specific college document snippet was retrieved for this exact query.

Instructions:
1. ${languageInstruction}
2. If the student is greeting you (e.g. "hi", "hello", "good morning", "thanks"), respond warmly, politely, and conversationally.
3. If the student is asking a general conversation question, answer helpfully and clearly.
4. STRICT ANTI-HALLUCINATION RULE: If the student asks for specific CET dates, fees, rules, or policies that require official verification, state clearly: "This specific policy or rule detail is not mentioned in official CET documents. Please contact the concerned department desk for verification."
5. Use bold text (**Title**) for key titles and terms. Keep formatting spacious and readable.
6. Do NOT invent or guess any CET rule, date, or percentage.`;
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

STRICT GROUNDING & BEAUTIFUL FORMATTING RULES:
1. ZERO HALLUCINATION MANDATE: Rely STRICTLY on the retrieved documentation above. You MUST NOT invent, guess, extrapolate, or assume any CET rule, date, fee amount, percentage, or policy that is not explicitly written in the context.
2. If the retrieved context does not contain enough information to answer the question accurately, explicitly state: "Complete details for this specific CET policy could not be found in official documents. Please check with the concerned department desk."
3. Format the response beautifully with bold headings (**Key Point:**) and clear spaced bullet points so it is effortless to read.
4. Do NOT mix general university rules with CET specific regulations.
5. Do NOT append text lists of sources or references at the end of your response. The application UI handles displaying verified sources separately.`;
}
