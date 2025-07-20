import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[ONBOARDING] Session:', session);
    
    const body = await request.json();
    console.log('[ONBOARDING] Body:', body);
    const { name, bio, avatarUrl, links, userId } = body;

    let user = null;
    
    // Try to get user from session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({ where: { email: session.user.email } });
      console.log('[ONBOARDING] User found via session:', !!user, user?.email);
    }
    
    // If no user from session, try userId from body
    if (!user && userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
      console.log('[ONBOARDING] User found via userId:', !!user, user?.id);
    }
    
    if (!user) {
      console.log('[ONBOARDING] User not found in DB');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[ONBOARDING] Updating user with data:', {
      displayName: name || user.displayName,
      bio: bio || user.bio,
      avatarUrl: avatarUrl || user.avatarUrl,
    });

    // Profil aktualisieren
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: name || user.displayName,
        bio: bio || user.bio,
        avatarUrl: avatarUrl || user.avatarUrl,
      },
    });
    console.log('[ONBOARDING] User updated successfully:', {
      id: updatedUser.id,
      displayName: updatedUser.displayName,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl,
    });

    // Ersten Link anlegen, falls vorhanden
    if (Array.isArray(links) && links.length > 0) {
      const firstLink = links[0];
      if (firstLink.title && firstLink.url) {
        const createdLink = await prisma.link.create({
          data: {
            title: firstLink.title,
            url: firstLink.url,
            userId: user.id,
            position: 0,
            icon: 'globe',
            isActive: true,
            customColor: '#f3f4f6',
            useCustomColor: true,
          },
        });
        console.log('[ONBOARDING] First link created:', {
          id: createdLink.id,
          title: createdLink.title,
          url: createdLink.url,
          userId: createdLink.userId,
        });
      } else {
        console.log('[ONBOARDING] No valid first link - missing title or url');
      }
    } else {
      console.log('[ONBOARDING] No links array or empty');
    }

    // Verify the data was actually saved
    const finalUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        links: true,
      },
    });
    console.log('[ONBOARDING] Final user data:', {
      id: finalUser?.id,
      displayName: finalUser?.displayName,
      bio: finalUser?.bio,
      avatarUrl: finalUser?.avatarUrl,
      linksCount: finalUser?.links.length,
    });

    // Set a cookie to indicate successful onboarding
    const response = NextResponse.json({ success: true });
    response.cookies.set('onboarding-complete', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('[ONBOARDING] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 