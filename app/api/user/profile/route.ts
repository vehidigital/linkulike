import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { utapi } from "@/lib/uploadthing-server";

const profileUpdateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  originalAvatarUrl: z.string().url().optional(),
  avatarBorderColor: z.string().optional(),
  theme: z.string().optional(),
  backgroundColor: z.string().optional(),
  backgroundGradient: z.string().optional(),
  buttonStyle: z.string().optional(),
  buttonColor: z.string().optional(),
  buttonGradient: z.string().optional(),
  textColor: z.string().optional(),
  fontFamily: z.string().optional(),
})

// GET /api/user/profile - Get current user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        originalAvatarUrl: true, // Originalbild für das Frontend verfügbar machen
        avatarBorderColor: true, // Avatar-Rahmenfarbe
        theme: true,
        backgroundColor: true,
        backgroundGradient: true,
        buttonStyle: true,
        buttonColor: true,
        buttonGradient: true,
        textColor: true,
        fontFamily: true,
        isPremium: true,
        createdAt: true,
        updatedAt: true,
        lastUsernameChange: true,
        links: {
          orderBy: { position: "asc" },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
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
    const {
      username,
      displayName,
      bio,
      avatarUrl,
      originalAvatarUrl,
      avatarBorderColor,
      theme,
      backgroundColor,
      backgroundGradient,
      buttonStyle,
      buttonColor,
      buttonGradient,
      textColor,
      fontFamily,
    } = body

    // Check if username is being changed and if it's already taken
    let updateUsername = false;
    let user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (username && username !== user?.username) {
      // Prüfe, ob Username schon vergeben ist
      const existingUser = await prisma.user.findUnique({ where: { username } });
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

    // --- Avatar-Handling: Altes Bild löschen, wenn neues hochgeladen oder entfernt wird ---
    let oldAvatarUrl = user?.avatarUrl;
    let shouldDeleteOldAvatar = false;
    let oldFileKey = null;
    if (oldAvatarUrl && (avatarUrl === "" || (avatarUrl && avatarUrl !== oldAvatarUrl))) {
      // Extrahiere FileKey aus alter URL (z.B. .../f/<fileKey>)
      const match = oldAvatarUrl.match(/\/f\/([^/?#]+)/);
      if (match && match[1]) {
        oldFileKey = match[1];
        shouldDeleteOldAvatar = true;
      }
    }

    // --- Original-Avatar-Handling: Altes Original löschen, wenn neues hochgeladen wird ---
    let oldOriginalAvatarUrl = user?.originalAvatarUrl;
    let shouldDeleteOldOriginal = false;
    let oldOriginalFileKey = null;
    if (oldOriginalAvatarUrl && (originalAvatarUrl && originalAvatarUrl !== oldOriginalAvatarUrl)) {
      const match = oldOriginalAvatarUrl.match(/\/f\/([^/?#]+)/);
      if (match && match[1]) {
        oldOriginalFileKey = match[1];
        shouldDeleteOldOriginal = true;
      }
    }

    // Update User in DB
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        username: updateUsername ? username : undefined,
        lastUsernameChange: updateUsername ? new Date() : undefined,
        displayName: displayName || undefined,
        bio: bio || undefined,
        avatarUrl: avatarUrl === "" ? null : avatarUrl || undefined,
        originalAvatarUrl: originalAvatarUrl === "" ? null : originalAvatarUrl || undefined,
        avatarBorderColor: avatarBorderColor || undefined,
        theme: theme || undefined,
        backgroundColor: backgroundColor || undefined,
        backgroundGradient: backgroundGradient || undefined,
        buttonStyle: buttonStyle || undefined,
        buttonColor: buttonColor || undefined,
        buttonGradient: buttonGradient || undefined,
        textColor: textColor || undefined,
        fontFamily: fontFamily || undefined,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        originalAvatarUrl: true,
        avatarBorderColor: true,
        theme: true,
        backgroundColor: true,
        backgroundGradient: true,
        buttonStyle: true,
        buttonColor: true,
        buttonGradient: true,
        textColor: true,
        fontFamily: true,
        isPremium: true,
        createdAt: true,
        updatedAt: true,
        lastUsernameChange: true,
        links: {
          orderBy: { position: "asc" },
        },
      },
    })

    // Nach erfolgreichem Update: Altes Avatar-Bild bei Uploadthing löschen
    if (shouldDeleteOldAvatar && oldFileKey) {
      try {
        await utapi.deleteFiles(oldFileKey);
      } catch (err) {
        console.error("Fehler beim Löschen des alten Avatars bei Uploadthing:", err);
      }
    }

    // Nach erfolgreichem Update: Altes Originalbild löschen
    if (shouldDeleteOldOriginal && oldOriginalFileKey) {
      try {
        await utapi.deleteFiles(oldOriginalFileKey);
      } catch (err) {
        console.error("Fehler beim Löschen des alten Original-Avatars bei Uploadthing:", err);
      }
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 