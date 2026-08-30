import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createSessionToken } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();
    const userEmail = (email || 'google.student@cet.ac.in').toLowerCase().trim();
    const userName = name || 'CET Student';

    let user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userName,
          passwordHash: 'google_oauth_authenticated',
          role: 'STUDENT',
        },
      });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'STUDENT' | 'ADMIN',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set('askcet_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Google Auth Route Error:', err);
    return NextResponse.json({ error: 'Google authentication failed' }, { status: 500 });
  }
}
