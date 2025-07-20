import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { utapi } from '@/lib/uploadthing-server';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('=== AVATAR DELETE API CALLED ===')
    console.log('USERID:', userId)
    
    let user = null;
    
    // Try to get user by userId first (for unauthenticated access)
    if (userId) {
      try {
        console.log('[AVATAR DELETE] Searching for user with userId:', userId);
        user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, avatarUrl: true, originalAvatarUrl: true }
        });
        console.log('[AVATAR DELETE] User found via userId:', !!user, user?.id);
      } catch (error) {
        console.error('[AVATAR DELETE] Error finding user via userId:', error);
      }
    }
    
    // If no user from userId, try session (for authenticated access)
    if (!user) {
      try {
        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
          user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, avatarUrl: true, originalAvatarUrl: true }
          });
          console.log('[AVATAR DELETE] User found via session:', !!user, user?.email);
        }
      } catch (error) {
        console.error('[AVATAR DELETE] Error with session:', error);
      }
    }
    
    if (!user) {
      console.log('[AVATAR DELETE] No user found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete from UploadThing if exists
    const urlsToDelete = [user.avatarUrl, user.originalAvatarUrl].filter(Boolean);
    
    for (const url of urlsToDelete) {
      if (url) {
        try {
          const avatarKey = url.split('/').pop();
          if (avatarKey && avatarKey.startsWith('linkulike-avatar-')) {
            await utapi.deleteFiles([avatarKey]);
            console.log('Avatar deleted from UploadThing:', avatarKey);
          }
        } catch (deleteError) {
          console.log('Could not delete avatar from UploadThing:', deleteError);
        }
      }
    }

    // Update user to remove avatar
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        avatarUrl: null,
        originalAvatarUrl: null
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 