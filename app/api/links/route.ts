import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"
import { z } from "zod"

const linkSchema = z.object({
  title: z.string().min(1).max(100),
  url: z.string().url(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  customColor: z.string().optional(),
  useCustomColor: z.boolean().optional(),
  highlight: z.boolean().optional(),
  highlightStyle: z.string().optional(),
  imageUrl: z.string().optional(),
})

// GET /api/links - Get all links for the current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const session = await getServerSession(authOptions);
    console.log('[LINKS] Session:', session);
    console.log('[LINKS] UserId from params:', userId);
    
    let user = null;
    
    // Try to get user from session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          links: {
            orderBy: { position: "asc" },
            include: {
              clicks: {
                orderBy: { clickedAt: "desc" },
                take: 10, // Get last 10 clicks for recent activity
              },
              _count: {
                select: { clicks: true }, // Get total click count
              },
            },
          },
        },
      });
      console.log('[LINKS] User found via session:', !!user, user?.email);
    }
    
    // If no user from session, try userId from params
    if (!user && userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          links: {
            orderBy: { position: "asc" },
            include: {
              clicks: {
                orderBy: { clickedAt: "desc" },
                take: 10, // Get last 10 clicks for recent activity
              },
              _count: {
                select: { clicks: true }, // Get total click count
              },
            },
          },
        },
      });
      console.log('[LINKS] User found via userId:', !!user, user?.id);
    }

    if (!user) {
      console.log('[LINKS] No user found, returning empty array');
      return NextResponse.json([])
    }

    // Add analytics summary to each link
    const linksWithAnalytics = user.links.map((link: any) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      position: link.position,
      icon: link.icon,
      isActive: link.isActive,
      customColor: link.customColor,
      useCustomColor: link.useCustomColor,
      textColorOverride: link.textColorOverride,
      highlight: link.highlight,
      highlightStyle: link.highlightStyle,
      imageUrl: link.imageUrl,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
      analytics: {
        totalClicks: link._count?.clicks || 0,
        recentClicks: link.clicks?.length || 0,
        lastClick: link.clicks?.[0]?.clickedAt || null,
      },
    }))

    return NextResponse.json(linksWithAnalytics)
  } catch (error) {
    console.error("Error fetching links:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/links - Create a new link
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const session = await getServerSession(authOptions);
    console.log('[LINKS-POST] Session:', session);
    console.log('[LINKS-POST] UserId from params:', userId);
    
    let user = null;
    
    // Try to get user from session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      console.log('[LINKS-POST] User found via session:', !!user, user?.email);
    }
    
    // If no user from session, try userId from params
    if (!user && userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
      console.log('[LINKS-POST] User found via userId:', !!user, user?.id);
    }

    if (!user) {
      console.log('[LINKS-POST] No user found');
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, url, icon, position, customColor, useCustomColor, highlight, highlightStyle, imageUrl } = body

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 }
      )
    }

    // Create link and audit log in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const link = await tx.link.create({
        data: {
          title,
          url,
          icon: icon || "globe",
          position: position || 0,
          customColor: customColor !== undefined ? customColor : "#f3f4f6",
          useCustomColor: useCustomColor !== undefined ? useCustomColor : true,
          highlight: highlight !== undefined ? highlight : false,
          highlightStyle: highlightStyle || "star",
          imageUrl: imageUrl || null,
          userId: user.id,
        },
      })

      // Create audit log for link creation
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "link_created",
          target: "link",
          details: JSON.stringify({
            title,
            url,
            icon: icon || "globe",
            position: position || 0,
          }),
        },
      })

      return link
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating link:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/links - Update multiple links (for reordering)
export async function PUT(request: NextRequest) {
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

    // Fix: Unterstütze sowohl Array als auch Objekt mit links-Array
    const body = await request.json();
    const links = Array.isArray(body) ? body : body.links;
    if (!Array.isArray(links)) {
      return NextResponse.json({ error: "Invalid links payload" }, { status: 400 });
    }

    // Update all links in a transaction
    const updatedLinks = await prisma.$transaction(
      links.map((link: any) =>
        prisma.link.update({
          where: {
            id: link.id,
            userId: user.id, // Ensure user owns the link
          },
          data: {
            title: link.title,
            url: link.url,
            icon: link.icon,
            position: link.position,
            isActive: link.isActive,
            customColor: link.customColor,
            useCustomColor: link.useCustomColor,
          },
        })
      )
    )

    return NextResponse.json(updatedLinks)
  } catch (error) {
    console.error("Error updating links:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 