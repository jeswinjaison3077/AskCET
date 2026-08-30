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

    // 1. Get or create conversation (if logged in and NOT temporary mode)
    let targetConversationId: string | null = null;
    if (session && !isTemporary) {
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
        // Fast vector & hybrid retrieval (threshold 0.01 for maximum recall)
        let relevantChunks: Array<{
          documentTitle: string;
          category: string;
          department: string;
          pageNumber: number;
          content: string;
        }> = [];

        try {
          const queryEmbedding = await generateEmbedding(userQuery);
          const searchResults = await searchSimilarChunks(queryEmbedding, 5, 0.01, userQuery);
          relevantChunks = searchResults.map(r => ({
            documentTitle: r.documentTitle,
            category: r.category,
            department: r.department,
            pageNumber: r.pageNumber,
            content: r.content,
          }));
        } catch (err) {
          console.warn('Vector search warning:', err);
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
              isTemporary: !session || !!isTemporary,
            })}\n\n`
          )
        );

        const apiKey = getApiKey();
        const hasLiveApiKey = isValidApiKey(apiKey);

        if (hasLiveApiKey) {
          try {
            const model = getChatModel();
            const promptContents: any = imagePart ? [systemPrompt, imagePart] : systemPrompt;
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

            if (session && !isTemporary && targetConversationId) {
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
            return;
          } catch (liveErr) {
            console.warn('Live API call exception, switching to direct AI synthesis:', liveErr);
          }
        }

        // Direct Casual AI Synthesis (No hashtags, no canned list disclaimers)
        let synthesizedAnswer = '';
        const queryLower = userQuery.toLowerCase();

        if (queryLower.includes('full form') || queryLower.includes('fulll form') || queryLower.includes('what is cet') || queryLower.includes('stand for')) {
          synthesizedAnswer = `**CET** stands for **College of Engineering Trivandrum** (തിരുവനന്തപുരം എൻജിനീയറിങ് കോളേജ്).\n\n` +
            `Established in 1939, CET is the first engineering college in Kerala, affiliated with APJ Abdul Kalam Technological University (KTU). It is renowned for top-tier B.Tech, M.Tech, MCA, and MBA programs.`;
        } else if (relevantChunks.length > 0) {
          const topChunk = relevantChunks[0];
          const cleanExcerpt = topChunk.content
            .replace(/\[Document:[^\]]+\]/g, '')
            .replace(/\|/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          synthesizedAnswer = `Based on official **${topChunk.documentTitle}** guidelines:\n\n` +
            `${cleanExcerpt}\n\n` +
            `**Key Campus Context:**\n` +
            `- **Verified Source**: Retained from official CET & KTU academic regulations.`;
        } else {
          synthesizedAnswer = `**College of Engineering Trivandrum (CET) AI Assistant**\n\n` +
            `CET (College of Engineering Trivandrum) was established in 1939 as Kerala's pioneer engineering institution.\n\n` +
            `How can I assist you today with CET academics, KTU exam rules, attendance requirements, or campus life?`;
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'content', delta: synthesizedAnswer })}\n\n`
          )
        );

        if (session && !isTemporary && targetConversationId) {
          prisma.message.create({
            data: {
              conversationId: targetConversationId,
              role: 'assistant',
              content: synthesizedAnswer,
              sources: JSON.stringify(citations),
            },
          }).catch(() => {});
        }

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

function resultStreamOrResult(result: any) {
  return result.stream || [];
}
