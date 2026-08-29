import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { generateEmbedding, getChatModel } from '@/lib/ai/gemini';
import { searchSimilarChunks } from '@/lib/rag/vector-store';
import { buildRAGSystemPrompt } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationId } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
    }

    // 1. Get or create conversation
    let targetConversationId = conversationId;
    if (!targetConversationId) {
      const titleSnippet = message.slice(0, 30) + (message.length > 30 ? '...' : '');
      const newConv = await prisma.conversation.create({
        data: {
          title: titleSnippet,
          userId: session.userId,
        },
      });
      targetConversationId = newConv.id;
    }

    // Save user message to DB
    await prisma.message.create({
      data: {
        conversationId: targetConversationId,
        role: 'user',
        content: message,
      },
    });

    // 2. Generate embedding & vector search
    let relevantChunks: Array<{
      documentTitle: string;
      category: string;
      department: string;
      pageNumber: number;
      content: string;
    }> = [];

    try {
      const queryEmbedding = await generateEmbedding(message);
      const searchResults = await searchSimilarChunks(queryEmbedding, 5, 0.4);
      
      relevantChunks = searchResults.map(r => ({
        documentTitle: r.documentTitle,
        category: r.category,
        department: r.department,
        pageNumber: r.pageNumber,
        content: r.content,
      }));
    } catch (embeddingError) {
      console.warn('Embedding search error, proceeding with direct prompt:', embeddingError);
    }

    // 3. Construct System Prompt & Citations list
    const systemPrompt = buildRAGSystemPrompt(relevantChunks, message);
    const citations = relevantChunks.map(c => ({
      documentTitle: c.documentTitle,
      category: c.category,
      department: c.department,
      pageNumber: c.pageNumber,
      snippet: c.content.slice(0, 150) + '...',
    }));

    // 4. Stream response from Gemini
    const model = getChatModel();
    const result = await model.generateContentStream(systemPrompt);

    const encoder = new TextEncoder();
    let accumulatedText = '';

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial metadata chunk with conversationId and citations
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'metadata',
              conversationId: targetConversationId,
              citations: citations,
            })}\n\n`
          )
        );

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          accumulatedText += chunkText;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'content', delta: chunkText })}\n\n`
            )
          );
        }

        // Save complete assistant message to database
        await prisma.message.create({
          data: {
            conversationId: targetConversationId,
            role: 'assistant',
            content: accumulatedText,
            sources: JSON.stringify(citations),
          },
        });

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
