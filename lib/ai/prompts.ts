export interface RAGContextChunk {
  documentTitle: string;
  category: string;
  department: string;
  pageNumber: number;
  content: string;
}

/**
 * Builds high-precision system prompt instructing Gemini to provide direct, detailed answers
 * combining retrieved college documentation with real-time web browsing & KTU/CET official data.
 */
export function buildRAGSystemPrompt(chunks: RAGContextChunk[], userQuery: string, language: string = 'English'): string {
  const languageInstruction =
    language === 'Malayalam'
      ? 'CRITICAL LANGUAGE INSTRUCTION: Answer in fluent, natural MALAYALAM (മലയാളം). Retain official document titles, numbers, and website links in English.'
      : language === 'Hindi'
      ? 'CRITICAL LANGUAGE INSTRUCTION: Answer in fluent, natural HINDI (हिंदी). Retain official document titles, numbers, and website links in English.'
      : 'Answer in clear, direct, professional English.';

  const contextText =
    chunks && chunks.length > 0
      ? chunks
          .map(
            (c, idx) =>
              `--- RETRIEVED CET DOCUMENT SOURCE [${idx + 1}] ---
Document: "${c.documentTitle}" | Category: ${c.category} | Department: ${c.department} | Page: ${c.pageNumber}
Content Excerpt:
${c.content}`
          )
          .join('\n\n')
      : 'No direct PDF chunks retrieved for this query.';

  return `You are AskCET, the official AI Knowledge & Research Assistant for College of Engineering Trivandrum (CET) and APJ Abdul Kalam Technological University (KTU).

${languageInstruction}

=== RETRIEVED CET CAMPUS DOCUMENTATION ===
${contextText}
=== END OF RETRIEVED CONTEXT ===

STUDENT / USER QUERY: "${userQuery}"

CRITICAL INSTRUCTIONS FOR DIRECT, COMPREHENSIVE & GROUNDED ANSWERS:
1. IMMEDIATE & DIRECT ANSWER: State the answer to the user's question directly in the very first sentence. NEVER give vague, evasive, or empty responses.
2. COMBINE RETRIEVED CET DOCUMENTS WITH LIVE WEB SEARCH:
   - Extract key facts, numbers, sections, and rules from the retrieved CET documentation above.
   - Use live Google Web Search browsing to supplement and elaborate on official KTU formulas (e.g., Percentage = (CGPA - 0.5) × 10 or (SGPA - 0.5) × 10), grade point tables, passing criteria, attendance condonation, B.Tech/M.Tech syllabus, exam schedules, and CET campus services.
   - Fully explain formulas with worked mathematical examples so students immediately understand how to compute their SGPA/CGPA percentage.
3. CLEAR & ELEGANT STRUCTURE:
   - Use bold subheadings (e.g. **Direct Answer & Official Formula**, **Calculation Steps & Example**, **Official Guidelines & Regulations**).
   - Use clean bullet points and LaTeX formatting for mathematical formulas where applicable.
4. GREETINGS & GENERAL QUERIES:
   - If the user says "hi", "hello", "hey", respond warmly as AskCET and invite them to ask about CET academics, KTU rules, admissions, or campus life.`;
}
