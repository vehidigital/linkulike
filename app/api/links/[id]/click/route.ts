import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST /api/links/[id]/click - Track a link click
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { ipAddress, userAgent, referer } = body

    // Verify the link exists
    const link = await prisma.link.findUnique({
      where: { id: params.id },
    })

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Create click record
    const click = await prisma.linkClick.create({
      data: {
        linkId: params.id,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        referer: referer || null,
      },
    })

    return NextResponse.json(click)
  } catch (error) {
    console.error("Error tracking click:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 