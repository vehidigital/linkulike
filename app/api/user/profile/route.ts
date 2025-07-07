import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { z } from "zod"

const profileUpdateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
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
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      })

      if (existingUser && existingUser.email !== session.user.email) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        username: username || undefined,
        displayName: displayName || undefined,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined,
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
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 