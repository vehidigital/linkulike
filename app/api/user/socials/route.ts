import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"

// GET /api/user/socials - Get user's social media links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const session = await getServerSession(authOptions);
    console.log('[SOCIALS] Session:', session);
    console.log('[SOCIALS] UserId from params:', userId);
    
    let user = null;
    
    // Try to get user from session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          socials: {
            orderBy: { position: "asc" },
          },
        },
      });
      console.log('[SOCIALS] User found via session:', !!user, user?.email);
    }
    
    // If no user from session, try userId from params
    if (!user && userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          socials: {
            orderBy: { position: "asc" },
          },
        },
      });
      console.log('[SOCIALS] User found via userId:', !!user, user?.id);
    }

    if (!user) {
      console.log('[SOCIALS] No user found, returning empty array');
      return NextResponse.json([])
    }

    return NextResponse.json(user.socials || [])
  } catch (error) {
    console.error("Error fetching socials:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/user/socials - Add a new social media link
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const session = await getServerSession(authOptions);
    console.log('[SOCIALS-POST] Session:', session);
    console.log('[SOCIALS-POST] UserId from params:', userId);
    
    let user = null;
    
    // Try to get user from session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      console.log('[SOCIALS-POST] User found via session:', !!user, user?.email);
    }
    
    // If no user from session, try userId from params
    if (!user && userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
      console.log('[SOCIALS-POST] User found via userId:', !!user, user?.id);
    }

    if (!user) {
      console.log('[SOCIALS-POST] No user found');
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { platform, url, customPlatform } = body

    if (!platform || !url) {
      return NextResponse.json(
        { error: "Platform and URL are required" },
        { status: 400 }
      )
    }

    // Use custom platform name if provided
    const finalPlatform = platform === 'other' && customPlatform ? customPlatform : platform;

    // Get current max position
    const maxPosition = await prisma.social.aggregate({
      where: { userId: user.id },
      _max: { position: true },
    });

    const newPosition = (maxPosition._max.position || -1) + 1;

    // Create new social with 'value' field (not 'url')
    const newSocial = await prisma.social.create({
      data: {
        userId: user.id,
        platform: finalPlatform,
        value: url, // Use 'value' field as per Prisma schema
        position: newPosition,
      },
    });

    console.log('[SOCIALS-POST] Created new social:', newSocial);

    return NextResponse.json(newSocial)
  } catch (error) {
    console.error("Error creating social:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/user/socials - Update user's social media links
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const session = await getServerSession(authOptions);
    console.log('[SOCIALS-PUT] Session:', session);
    console.log('[SOCIALS-PUT] UserId from params:', userId);
    
    let user = null;
    
    // Try to get user from session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      console.log('[SOCIALS-PUT] User found via session:', !!user, user?.email);
    }
    
    // If no user from session, try userId from params
    if (!user && userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
      console.log('[SOCIALS-PUT] User found via userId:', !!user, user?.id);
    }

    if (!user) {
      console.log('[SOCIALS-PUT] No user found');
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { socials } = body

    if (!Array.isArray(socials)) {
      return NextResponse.json(
        { error: "Socials must be an array" },
        { status: 400 }
      )
    }

    // Delete existing socials and create new ones
    await prisma.$transaction(async (tx: any) => {
      await tx.social.deleteMany({
        where: { userId: user.id },
      })

      if (socials.length > 0) {
        await tx.social.createMany({
          data: socials.map((social: any, index: number) => ({
            userId: user.id,
            platform: social.platform,
            value: social.url, // Use 'value' field as per Prisma schema
            position: index,
          })),
        })
      }
    })

    // Return updated socials
    const updatedSocials = await prisma.social.findMany({
      where: { userId: user.id },
      orderBy: { position: "asc" },
    })

    return NextResponse.json(updatedSocials)
  } catch (error) {
    console.error("Error updating socials:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/user/socials - Delete a social media link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const session = await getServerSession(authOptions);
    console.log('[SOCIALS-DELETE] Session:', session);
    console.log('[SOCIALS-DELETE] UserId from params:', userId);
    
    let user = null;
    
    // Try to get user from session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      console.log('[SOCIALS-DELETE] User found via session:', !!user, user?.email);
    }
    
    // If no user from session, try userId from params
    if (!user && userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
      console.log('[SOCIALS-DELETE] User found via userId:', !!user, user?.id);
    }

    if (!user) {
      console.log('[SOCIALS-DELETE] No user found');
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: "Social ID is required" },
        { status: 400 }
      )
    }

    // Delete the social
    await prisma.social.delete({
      where: {
        id: id,
        userId: user.id, // Ensure user owns this social
      },
    });

    console.log('[SOCIALS-DELETE] Deleted social:', id);

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting social:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 