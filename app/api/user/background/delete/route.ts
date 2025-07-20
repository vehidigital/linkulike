import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { utapi } from '@/lib/uploadthing-server';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('=== BACKGROUND DELETE API CALLED ===')
    console.log('USERID:', userId)
    
    let user = null;
    
    // Try to get user by userId first (for unauthenticated access)
    if (userId) {
      try {
        console.log('[BACKGROUND DELETE] Searching for user with userId:', userId);
        user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, backgroundImageUrl: true }
        });
        console.log('[BACKGROUND DELETE] User found via userId:', !!user, user?.id);
      } catch (error) {
        console.error('[BACKGROUND DELETE] Error finding user via userId:', error);
      }
    }
    
    // If no user from userId, try session (for authenticated access)
    if (!user) {
      try {
        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
          user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, backgroundImageUrl: true }
          });
          console.log('[BACKGROUND DELETE] User found via session:', !!user, user?.email);
        }
      } catch (error) {
        console.error('[BACKGROUND DELETE] Error with session:', error);
      }
    }
    
    if (!user) {
      console.log('[BACKGROUND DELETE] No user found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete from UploadThing if exists
    if (user.backgroundImageUrl) {
      try {
        const backgroundKey = user.backgroundImageUrl.split('/').pop();
        if (backgroundKey && backgroundKey.startsWith('linkulike-background-')) {
          await utapi.deleteFiles([backgroundKey]);
          console.log('Background deleted from UploadThing:', backgroundKey);
        }
      } catch (deleteError) {
        console.log('Could not delete background from UploadThing:', deleteError);
      }
    }

    // Update user to remove background
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        backgroundImageUrl: null,
        backgroundImageActive: false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting background:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 