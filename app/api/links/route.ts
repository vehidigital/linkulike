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
            clicks: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user.links)
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

    const link = await prisma.link.create({
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

    return NextResponse.json(link)
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

    const links = await request.json()

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