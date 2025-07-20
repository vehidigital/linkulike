import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { z } from "zod"

const linkUpdateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  position: z.number().optional(),
  customColor: z.string().optional(),
  useCustomColor: z.boolean().optional(),
})

// GET /api/links/[id] - Get a specific link
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const session = await getServerSession(authOptions);
    console.log('[LINKS-GET] Session:', session);
    console.log('[LINKS-GET] UserId from params:', userId);
    
    let user = null;
    
    // Try to get user from session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      console.log('[LINKS-GET] User found via session:', !!user, user?.email);
    }
    
    // If no user from session, try userId from params
    if (!user && userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
      console.log('[LINKS-GET] User found via userId:', !!user, user?.id);
    }

    if (!user) {
      console.log('[LINKS-GET] No user found');
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const link = await prisma.link.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        clicks: true,
      },
    })

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    return NextResponse.json(link)
  } catch (error) {
    console.error("Error fetching link:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/links/[id] - Delete a specific link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const session = await getServerSession(authOptions);
    console.log('[LINKS-DELETE] Session:', session);
    console.log('[LINKS-DELETE] UserId from params:', userId);
    
    let user = null;
    
    // Try to get user from session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      console.log('[LINKS-DELETE] User found via session:', !!user, user?.email);
    }
    
    // If no user from session, try userId from params
    if (!user && userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
      console.log('[LINKS-DELETE] User found via userId:', !!user, user?.id);
    }

    if (!user) {
      console.log('[LINKS-DELETE] No user found');
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const link = await prisma.link.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    await prisma.link.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Link deleted successfully" })
  } catch (error) {
    console.error("Error deleting link:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/links/[id] - Update a specific link
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const session = await getServerSession(authOptions);
    console.log('[LINKS-PUT] Session:', session);
    console.log('[LINKS-PUT] UserId from params:', userId);
    
    let user = null;
    
    // Try to get user from session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      console.log('[LINKS-PUT] User found via session:', !!user, user?.email);
    }
    
    // If no user from session, try userId from params
    if (!user && userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
      console.log('[LINKS-PUT] User found via userId:', !!user, user?.id);
    }

    if (!user) {
      console.log('[LINKS-PUT] No user found');
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, url, icon, position, isActive, customColor, useCustomColor } = body

    const link = await prisma.link.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    const updatedLink = await prisma.link.update({
      where: {
        id: params.id,
      },
      data: {
        title: title || link.title,
        url: url || link.url,
        icon: icon || link.icon,
        position: position !== undefined ? position : link.position,
        isActive: isActive !== undefined ? isActive : link.isActive,
        customColor: customColor !== undefined ? customColor : link.customColor,
        useCustomColor: useCustomColor !== undefined ? useCustomColor : link.useCustomColor,
      },
    })

    return NextResponse.json(updatedLink)
  } catch (error) {
    console.error("Error updating link:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 