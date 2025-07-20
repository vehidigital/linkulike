import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { z } from "zod";

const profileUpdateSchema = z.object({
  username: z.string().min(1).max(50).optional(),
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  originalAvatarUrl: z.string().url().optional().or(z.literal("")),
  avatarBorderColor: z.string().optional(),
  theme: z.string().optional(),
  backgroundColor: z.string().optional(),
  backgroundGradient: z.string().optional(),
  buttonStyle: z.string().optional(),
  buttonColor: z.string().optional(),
  buttonGradient: z.string().optional(),
  textColor: z.string().optional(),
  fontFamily: z.string().optional(),
  backgroundImageUrl: z.string().url().optional().or(z.literal("")),
  originalBackgroundImageUrl: z.string().url().optional().or(z.literal("")),
  backgroundCropDesktopUrl: z.string().url().optional().or(z.literal("")),
  backgroundCropMobileUrl: z.string().url().optional().or(z.literal("")),
  backgroundCropDesktop: z.any().optional(),
  backgroundCropMobile: z.any().optional(),
  backgroundOverlayType: z.enum(["none", "dark", "light", "custom"]).optional(),
  backgroundOverlayColor: z.string().optional(),
  backgroundOverlayOpacity: z.number().optional(),
  backgroundImageActive: z.boolean().optional(),
  // Pro-Features für individuelle Textfarben
  displayNameColor: z.string().optional(),
  usernameColor: z.string().optional(),
  bioColor: z.string().optional(),
  footerColor: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const session = await getServerSession(authOptions);
    console.log('[PROFILE] Session:', session);
    console.log('[PROFILE] UserId from params:', userId);
    
    let user = null;
    
    // Try to get user from session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({ 
        where: { email: session.user.email },
        select: { id: true, email: true, username: true, displayName: true, bio: true, avatarUrl: true }
      });
      console.log('[PROFILE] User found via session:', !!user, user?.email);
    }
    
    // If no user from session, try userId from params
    if (!user && userId) {
      user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { id: true, email: true, username: true, displayName: true, bio: true, avatarUrl: true }
      });
      console.log('[PROFILE] User found via userId:', !!user, user?.id);
    }
    
    if (!user) {
      console.log('[PROFILE] User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[PROFILE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input with Zod
    const validationResult = profileUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error)
      return NextResponse.json(
        { error: "Invalid input data", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Check if username is being changed and if it's already taken
    let updateUsername = false;
    let user = await prisma.user.findUnique({ 
      where: { email: session.user.email },
      select: {
        username: true,
        lastUsernameChange: true,
        avatarUrl: true,
      }
    });
    
    if (validatedData.username && validatedData.username !== user?.username) {
      // Prüfe, ob Username schon vergeben ist
      const existingUser = await prisma.user.findUnique({ where: { username: validatedData.username } });
      if (existingUser && existingUser.email !== session.user.email) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
      // Prüfe 30-Tage-Sperre
      const now = new Date();
      const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
      if (user?.lastUsernameChange && now.getTime() - new Date(user.lastUsernameChange).getTime() < THIRTY_DAYS) {
        const nextChange = new Date(new Date(user.lastUsernameChange).getTime() + THIRTY_DAYS);
        return NextResponse.json(
          { error: `You can change your username again on ${nextChange.toLocaleDateString()}.` },
          { status: 400 }
        );
      }
      updateUsername = true;
    }

    // Prepare update data - only include fields that are actually provided
    const updateData: any = {};
    
    if (updateUsername) {
      updateData.username = validatedData.username;
      updateData.lastUsernameChange = new Date();
    }
    
    if (validatedData.displayName !== undefined) {
      updateData.displayName = validatedData.displayName || null;
    }
    if (validatedData.bio !== undefined) {
      updateData.bio = validatedData.bio || null;
    }
    if (validatedData.avatarUrl !== undefined) {
      updateData.avatarUrl = validatedData.avatarUrl || null;
    }
    if (validatedData.originalAvatarUrl !== undefined) {
      updateData.originalAvatarUrl = validatedData.originalAvatarUrl || null;
    }
    if (validatedData.avatarBorderColor !== undefined) {
      updateData.avatarBorderColor = validatedData.avatarBorderColor || null;
    }
    if (validatedData.theme !== undefined) {
      updateData.theme = validatedData.theme || null;
    }
    if (validatedData.backgroundColor !== undefined) {
      updateData.backgroundColor = validatedData.backgroundColor || null;
    }
    if (validatedData.backgroundGradient !== undefined) {
      updateData.backgroundGradient = validatedData.backgroundGradient || null;
    }
    if (validatedData.buttonStyle !== undefined) {
      updateData.buttonStyle = validatedData.buttonStyle || null;
    }
    if (validatedData.buttonColor !== undefined) {
      updateData.buttonColor = validatedData.buttonColor || null;
    }
    if (validatedData.buttonGradient !== undefined) {
      updateData.buttonGradient = validatedData.buttonGradient || null;
    }
    if (validatedData.textColor !== undefined) {
      updateData.textColor = validatedData.textColor || null;
    }
    if (validatedData.fontFamily !== undefined) {
      updateData.fontFamily = validatedData.fontFamily || null;
    }
    if (validatedData.backgroundImageUrl !== undefined) {
      updateData.backgroundImageUrl = validatedData.backgroundImageUrl || null;
    }
    if (validatedData.originalBackgroundImageUrl !== undefined) {
      updateData.originalBackgroundImageUrl = validatedData.originalBackgroundImageUrl || null;
    }
    if (validatedData.backgroundCropDesktopUrl !== undefined) {
      updateData.backgroundCropDesktopUrl = validatedData.backgroundCropDesktopUrl || null;
    }
    if (validatedData.backgroundCropMobileUrl !== undefined) {
      updateData.backgroundCropMobileUrl = validatedData.backgroundCropMobileUrl || null;
    }
    if (validatedData.backgroundCropDesktop !== undefined) {
      updateData.backgroundCropDesktop = validatedData.backgroundCropDesktop || null;
    }
    if (validatedData.backgroundCropMobile !== undefined) {
      updateData.backgroundCropMobile = validatedData.backgroundCropMobile || null;
    }
    if (validatedData.backgroundOverlayType !== undefined) {
      updateData.backgroundOverlayType = validatedData.backgroundOverlayType || null;
    }
    if (validatedData.backgroundOverlayColor !== undefined) {
      updateData.backgroundOverlayColor = validatedData.backgroundOverlayColor || null;
    }
    if (validatedData.backgroundOverlayOpacity !== undefined) {
      updateData.backgroundOverlayOpacity = validatedData.backgroundOverlayOpacity;
    }
    if (validatedData.backgroundImageActive !== undefined) {
      updateData.backgroundImageActive = validatedData.backgroundImageActive;
    }
    if (validatedData.displayNameColor !== undefined) {
      updateData.displayNameColor = validatedData.displayNameColor || null;
    }
    if (validatedData.usernameColor !== undefined) {
      updateData.usernameColor = validatedData.usernameColor || null;
    }
    if (validatedData.bioColor !== undefined) {
      updateData.bioColor = validatedData.bioColor || null;
    }
    if (validatedData.footerColor !== undefined) {
      updateData.footerColor = validatedData.footerColor || null;
    }

    // Update User in DB
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      include: {
        links: {
          orderBy: { position: "asc" },
        },
      },
    })

    // Manually construct the response to include all needed fields
    const userResponse = {
      id: updatedUser.id,
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl,
      theme: updatedUser.theme,
      backgroundColor: updatedUser.backgroundColor,
      backgroundGradient: updatedUser.backgroundGradient,
      buttonStyle: updatedUser.buttonStyle,
      buttonColor: updatedUser.buttonColor,
      buttonGradient: updatedUser.buttonGradient,
      textColor: updatedUser.textColor,
      fontFamily: updatedUser.fontFamily,
      isPremium: updatedUser.isPremium,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      lastUsernameChange: updatedUser.lastUsernameChange,
      links: updatedUser.links,
      // Add these fields if they exist (for backward compatibility)
      ...(updatedUser as any).originalAvatarUrl && { originalAvatarUrl: (updatedUser as any).originalAvatarUrl },
      ...(updatedUser as any).avatarBorderColor && { avatarBorderColor: (updatedUser as any).avatarBorderColor },
      ...(updatedUser as any).backgroundImageUrl && { backgroundImageUrl: (updatedUser as any).backgroundImageUrl },
      ...(updatedUser as any).originalBackgroundImageUrl && { originalBackgroundImageUrl: (updatedUser as any).originalBackgroundImageUrl },
      ...(updatedUser as any).backgroundCropDesktopUrl && { backgroundCropDesktopUrl: (updatedUser as any).backgroundCropDesktopUrl },
      ...(updatedUser as any).backgroundCropMobileUrl && { backgroundCropMobileUrl: (updatedUser as any).backgroundCropMobileUrl },
      ...(updatedUser as any).backgroundCropDesktop && { backgroundCropDesktop: (updatedUser as any).backgroundCropDesktop },
      ...(updatedUser as any).backgroundCropMobile && { backgroundCropMobile: (updatedUser as any).backgroundCropMobile },
      ...(updatedUser as any).backgroundOverlayType && { backgroundOverlayType: (updatedUser as any).backgroundOverlayType },
      ...(updatedUser as any).backgroundOverlayColor && { backgroundOverlayColor: (updatedUser as any).backgroundOverlayColor },
      ...(updatedUser as any).backgroundOverlayOpacity && { backgroundOverlayOpacity: (updatedUser as any).backgroundOverlayOpacity },
      ...(updatedUser as any).backgroundImageActive !== undefined && { backgroundImageActive: (updatedUser as any).backgroundImageActive },
      // Pro-Features für individuelle Textfarben
      ...(updatedUser as any).displayNameColor && { displayNameColor: (updatedUser as any).displayNameColor },
      ...(updatedUser as any).usernameColor && { usernameColor: (updatedUser as any).usernameColor },
      ...(updatedUser as any).bioColor && { bioColor: (updatedUser as any).bioColor },
      ...(updatedUser as any).footerColor && { footerColor: (updatedUser as any).footerColor },
    }

    return NextResponse.json(userResponse)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 