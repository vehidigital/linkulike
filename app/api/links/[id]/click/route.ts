import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

// POST /api/links/[id]/click - Track a link click
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Session für userId
    const session = await getServerSession(authOptions)
    // Header auslesen
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    const userAgent = request.headers.get('user-agent') || null
    const referer = request.headers.get('referer') || null
    // TODO: Geo/Device/OS/Browser aus Middleware oder externem Service
    const country = null
    const city = null
    const device = null
    const os = null
    const browser = null
    const sessionId = null

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
        ipAddress,
        userAgent,
        referer,
        userId: session?.user?.id ?? null,
        country,
        city,
        device,
        os,
        browser,
        sessionId,
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