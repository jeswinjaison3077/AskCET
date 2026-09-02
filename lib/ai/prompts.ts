export interface RAGContextChunk {
  documentTitle: string;
  category: string;
  department: string;
  pageNumber: number;
  content: string;
}

/**
 * Builds a fast, concise, high-intelligence system prompt for Gemini
 * combining minimal CET document facts with live web search & AI knowledge.
 */
export function buildRAGSystemPrompt(chunks: RAGContextChunk[], userQuery: string, language: string = 'English'): string {
  const languageInstruction =
    language === 'Malayalam'
      ? 'CRITICAL LANGUAGE INSTRUCTION: Answer in natural, concise MALAYALAM (മലയാളം). Keep official terms and links in English.'
      : language === 'Hindi'
      ? 'CRITICAL LANGUAGE INSTRUCTION: Answer in natural, concise HINDI (हिंदी). Keep official terms and links in English.'
      : 'Answer in concise, clear, direct, professional English.';

  const contextText =
    chunks && chunks.length > 0
      ? chunks
          .slice(0, 2)
          .map(
            (c, idx) =>
              `--- RELEVANT CET DOCUMENT FACT [${idx + 1}] ---
Document: "${c.documentTitle}" | Category: ${c.category}
Key Excerpt: ${c.content.slice(0, 500)}`
          )
          .join('\n\n')
      : 'No specific document chunks required.';

  return `You are AskCET, a fast AI assistant for College of Engineering Trivandrum (CET) and general web queries.

${languageInstruction}

=== MINIMAL RELEVANT DOCUMENT CONTEXT ===
${contextText}
=== END CONTEXT ===

USER QUERY: "${userQuery}"

CRITICAL INSTRUCTIONS FOR FAST, HIGHLY-RELEVANT RESPONSES:
1. BE DIRECT & CONCISE:
   - Get straight to the point immediately. Provide only the most relevant, accurate answer without fluff or long intros.
   - Use short, readable bullet points or a concise paragraph (2-4 sentences max unless a step-by-step math formula is requested).

2. COMBINE WEB SEARCH & CAMPUS FACTS:
   - Use live web search (cet.ac.in, ktu.edu.in, and general web knowledge) to provide the most up-to-date, relevant response.
   - Use minimal document facts above only if directly relevant to the user's question.

3. ACCURATE MATH FORMULAS:
   - For KTU SGPA/CGPA percentage formula: Percentage = (CGPA - 0.5) × 10. Show a quick 1-line calculation example.

4. GREETINGS:
   - If user says "hi" or "hello", greet briefly in 1 sentence and ask how you can help.`;
}
