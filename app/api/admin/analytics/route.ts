import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    const [totalUsers, totalConversations, totalMessages, totalDocuments, totalChunks, upvotes, downvotes, recentFeedback] = await Promise.all([
      prisma.user.count(),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.document.count(),
      prisma.documentChunk.count(),
      prisma.feedback.count({ where: { type: 'UPVOTE' } }),
      prisma.feedback.count({ where: { type: 'DOWNVOTE' } }),
      prisma.feedback.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          message: { select: { content: true } },
        },
      }),
    ]);

    const satisfactionRate = upvotes + downvotes > 0 ? Math.round((upvotes / (upvotes + downvotes)) * 100) : 100;

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalConversations,
        totalMessages,
        totalDocuments,
        totalChunks,
        upvotes,
        downvotes,
        satisfactionRate,
      },
      recentFeedback,
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
