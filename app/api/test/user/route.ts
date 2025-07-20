import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('[TEST] Looking for userId:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'No userId provided' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        theme: true,
        backgroundColor: true,
        buttonStyle: true,
        buttonColor: true,
        textColor: true,
        fontFamily: true,
        isVerified: true,
        createdAt: true,
      },
    });

    console.log('[TEST] User found:', !!user, user?.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      found: true,
      user: user,
    });
  } catch (error) {
    console.error('[TEST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 