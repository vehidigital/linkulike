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
})

// GET /api/links - Get all links for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
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
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Add analytics summary to each link
    const linksWithAnalytics = user.links.map(link => ({
      ...link,
      analytics: {
        totalClicks: link._count.clicks,
        recentClicks: link.clicks.length,
        lastClick: link.clicks[0]?.clickedAt || null,
      },
      clicks: undefined, // Remove detailed clicks from response
      _count: undefined, // Remove count from response
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, url, icon, position, customColor, useCustomColor } = body

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 }
      )
    }

    // Create link and audit log in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const link = await tx.link.create({
        data: {
          title,
          url,
          icon: icon || "globe",
          position: position || 0,
          customColor: customColor !== undefined ? customColor : "#f3f4f6",
          useCustomColor: useCustomColor !== undefined ? useCustomColor : true,
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
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