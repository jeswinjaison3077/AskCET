export interface RAGContextChunk {
  documentTitle: string;
  category: string;
  department: string;
  pageNumber: number;
  content: string;
}

/**
 * Builds high-precision system prompt instructing Gemini to provide direct, detailed answers
 * combining retrieved college documentation with real-world CET/KTU information.
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
              `--- CONTEXT SOURCE [${idx + 1}] ---
Document: "${c.documentTitle}" | Category: ${c.category} | Department: ${c.department} | Page: ${c.pageNumber}
Content:
${c.content}`
          )
          .join('\n\n')
      : 'No direct PDF chunks retrieved for this query.';

  return `You are AskCET, the official AI-powered College Information Assistant for CET (College of Engineering Trivandrum) and KTU (APJ Abdul Kalam Technological University).

${languageInstruction}

=== RETRIEVED COLLEGE DOCUMENTATION ===
${contextText}
=== END OF CONTEXT ===

STUDENT QUESTION: "${userQuery}"

CRITICAL INSTRUCTIONS FOR DIRECT, HIGH-PRECISION ANSWERS:
1. DIRECT & SPECIFIC ANSWER FIRST: Answer the student's question IMMEDIATELY, directly, and thoroughly. NEVER give vague, generic, or evasive responses.
2. INTEGRATE ACCURATE CET & KTU DETAILS:
   - Combine the retrieved documentation context above with authoritative CET (College of Engineering Trivandrum) and KTU (APJ Abdul Kalam Technological University) regulations, official procedures, web resources (cet.ac.in, ktu.edu.in), and campus operational knowledge.
   - Always state exact numbers, percentages (e.g., 75% attendance rule, 10% condonation limit, 160 credits, 100 activity points), official formulas (e.g., Percentage = (CGPA - 0.5) × 10), office counters (e.g., Academic Counter 3), warden portal processes, and step-by-step procedures.
3. CONVERSATIONAL GREETINGS:
   - If the student is greeting you (e.g. "hi", "hello", "good morning", "hey"), respond warmly and ask how you can help them with CET campus queries.
4. ELEGANT & READABLE FORMATTING:
   - Structure responses with bold section headings (e.g., **Direct Answer**, **Requirements & Procedure**, **Key Contact / Counter Details**).
   - Use concise, well-spaced bullet points so students get instant clarity.
5. NO VAGUE DISCLAIMERS: Do not use repetitive disclaimers. Provide direct, actionable campus guidance.`;
}
