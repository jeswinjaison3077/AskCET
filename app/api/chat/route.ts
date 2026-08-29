import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { generateEmbedding, getChatModel, isValidApiKey, getApiKey } from '@/lib/ai/gemini';
import { searchSimilarChunks } from '@/lib/rag/vector-store';
import { buildRAGSystemPrompt } from '@/lib/ai/prompts';
import { extractDocumentText } from '@/lib/rag/extractor';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationId, isTemporary, attachment, language } = await request.json();
    if (!message && !attachment) {
      return NextResponse.json({ error: 'Message content or attachment is required.' }, { status: 400 });
    }

    const preferredLanguage = language || 'English';
    const userQuery = message || `Please analyze this attached ${attachment?.type || 'file'}: ${attachment?.name}`;

    // Process document attachment text if uploaded
    let attachmentTextContext = '';
    let imagePart: { inlineData: { mimeType: string; data: string } } | null = null;

    if (attachment && attachment.data) {
      if (attachment.type === 'image' || attachment.mimeType?.startsWith('image/')) {
        imagePart = {
          inlineData: {
            mimeType: attachment.mimeType || 'image/png',
            data: attachment.data,
          },
        };
      } else {
        try {
          const fileBuffer = Buffer.from(attachment.data, 'base64');
          const ext = attachment.name?.split('.').pop() || 'pdf';
          const extracted = await extractDocumentText(fileBuffer, ext);
          attachmentTextContext = `\n\n[USER ATTACHED DOCUMENT: ${attachment.name}]\n${extracted.text.slice(0, 4000)}`;
        } catch (extractErr) {
          console.warn('Error extracting attached document text:', extractErr);
        }
      }
    }

    // 1. Get or create conversation (only if NOT temporary mode)
    let targetConversationId: string | null = null;
    if (!isTemporary) {
      let dbUser = await prisma.user.findUnique({ where: { id: session.userId } });
      let validUserId = dbUser ? session.userId : null;
      
      if (!validUserId) {
        const defaultUser = await prisma.user.findFirst();
        if (defaultUser) {
          validUserId = defaultUser.id;
        }
      }

      if (validUserId) {
        targetConversationId = conversationId;
        if (!targetConversationId) {
          const titleSnippet = userQuery.slice(0, 30) + (userQuery.length > 30 ? '...' : '');
          const newConv = await prisma.conversation.create({
            data: {
              title: titleSnippet,
              userId: validUserId,
            },
          });
          targetConversationId = newConv.id;
        }

        // Save user message to DB in background
        prisma.message.create({
          data: {
            conversationId: targetConversationId,
            role: 'user',
            content: attachment ? `${userQuery}\n📎 Attached: ${attachment.name}` : userQuery,
          },
        }).catch(() => {});
      }
    }

    const encoder = new TextEncoder();

    // 2. High-speed stream generation inside ReadableStream.start()
    const stream = new ReadableStream({
      async start(controller) {
        // Fast vector retrieval
        let relevantChunks: Array<{
          documentTitle: string;
          category: string;
          department: string;
          pageNumber: number;
          content: string;
        }> = [];

        try {
          const queryEmbedding = await generateEmbedding(userQuery);
          const searchResults = await searchSimilarChunks(queryEmbedding, 4, 0.35, userQuery);
          relevantChunks = searchResults.map(r => ({
            documentTitle: r.documentTitle,
            category: r.category,
            department: r.department,
            pageNumber: r.pageNumber,
            content: r.content,
          }));
        } catch {
          // Proceed without vector chunks if vector search delayed
        }

        const systemPrompt = buildRAGSystemPrompt(relevantChunks, userQuery, preferredLanguage) + attachmentTextContext;
        const citations = relevantChunks.map(c => ({
          documentTitle: c.documentTitle,
          category: c.category,
          department: c.department,
          pageNumber: c.pageNumber,
          snippet: c.content.slice(0, 150) + '...',
        }));

        // Send metadata immediately
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'metadata',
              conversationId: targetConversationId,
              citations: citations,
              isTemporary: !!isTemporary,
            })}\n\n`
          )
        );

        const model = getChatModel();
        const promptContents: any = imagePart ? [systemPrompt, imagePart] : systemPrompt;

        try {
          const result = await model.generateContentStream(promptContents);
          let accumulatedText = '';

          for await (const chunk of resultStreamOrResult(result)) {
            const chunkText = chunk.text();
            accumulatedText += chunkText;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'content', delta: chunkText })}\n\n`
              )
            );
          }

          // Save complete assistant response in background
          if (!isTemporary && targetConversationId) {
            prisma.message.create({
              data: {
                conversationId: targetConversationId,
                role: 'assistant',
                content: accumulatedText,
                sources: JSON.stringify(citations),
              },
            }).catch(() => {});
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (genErr: any) {
          console.warn('Gemini API stream fallback to Grounded RAG mode:', genErr?.message || genErr);

          let fallbackResponse = '';
          if (relevantChunks.length > 0) {
            fallbackResponse = `### AskCET Official Response\n\n` +
              `According to official college documentation:\n\n` +
              relevantChunks.map((c, i) => `**Information from ${c.documentTitle}**:\n${c.content}`).join('\n\n');
          } else {
            fallbackResponse = `### College Information System\n\nNo specific document matches found for "${userQuery}". You can ask about BTech CSE curriculum, academic calendar, hostel regulations, examination guidelines, or placement statistics.`;
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'content', delta: fallbackResponse })}\n\n`
            )
          );

          if (!isTemporary && targetConversationId) {
            prisma.message.create({
              data: {
                conversationId: targetConversationId,
                role: 'assistant',
                content: fallbackResponse,
                sources: JSON.stringify(citations),
              },
            }).catch(() => {});
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
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

function resultStreamOrResult(result: any) {
  return result.stream || [];
}
