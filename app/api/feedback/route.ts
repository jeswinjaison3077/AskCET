import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, type, reason, comment } = await request.json();

    if (!messageId || !type) {
      return NextResponse.json({ error: 'Message ID and feedback type are required.' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        messageId,
        userId: session.userId,
        type: type === 'UPVOTE' ? 'UPVOTE' : 'DOWNVOTE',
        reason: reason || null,
        comment: comment || null,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error('Submit feedback error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
