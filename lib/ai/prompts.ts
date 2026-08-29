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
export function buildRAGSystemPrompt(chunks: RAGContextChunk[], userQuery: string): string {
  if (!chunks || chunks.length === 0) {
    return `You are AskCET, the official AI-powered College Information Assistant.
The user is asking: "${userQuery}"

No relevant college documentation could be retrieved for this query.

Instructions:
1. State clearly and politely that you could not find reliable information about this topic in official college documents.
2. Advise the student to contact the concerned department, academic desk, or college administration directly.
3. Do NOT invent, assume, or hallucinate facts or policies.`;
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
Answer the student's question accurately, concisely, and exclusively using the authorized college documentation context provided below.

=== RETRIEVED COLLEGE DOCUMENTATION ===
${contextText}
=== END OF CONTEXT ===

STUDENT QUESTION: "${userQuery}"

STRICT GROUNDING RULES:
1. Rely ONLY on the information given in the retrieved documentation above.
2. If the retrieved context does not contain enough information to answer the question accurately, explicitly state: "I couldn't find complete information regarding this in official college documents. Please check with the concerned department."
3. Do NOT invent dates, fee amounts, room rules, attendance percentages, or policies that are not stated in the context.
4. Structure your response clearly using markdown formatting (bullet points, bold text).
5. At the end of your response, list the reference sources used in this exact format:
   
   **Sources:**
   - [Document Title] (Category | Page X)`;
}
