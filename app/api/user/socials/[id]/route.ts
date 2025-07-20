import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"

// PUT /api/user/socials/[id] - Update a specific social media link
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const session = await getServerSession(authOptions);
    console.log('[SOCIALS-PUT-ID] Session:', session);
    console.log('[SOCIALS-PUT-ID] UserId from params:', userId);
    
    let user = null;
    
    // Try to get user from session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      console.log('[SOCIALS-PUT-ID] User found via session:', !!user, user?.email);
    }
    
    // If no user from session, try userId from params
    if (!user && userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
      console.log('[SOCIALS-PUT-ID] User found via userId:', !!user, user?.id);
    }

    if (!user) {
      console.log('[SOCIALS-PUT-ID] No user found');
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { platform, value, customPlatform } = body

    if (!platform || !value) {
      return NextResponse.json(
        { error: "Platform and value are required" },
        { status: 400 }
      )
    }

    // Use custom platform name if provided
    const finalPlatform = platform === 'other' && customPlatform ? customPlatform : platform;

    // Check if social exists and belongs to user
    const existingSocial = await prisma.social.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingSocial) {
      return NextResponse.json({ error: "Social not found" }, { status: 404 })
    }

    // Update the social
    const updatedSocial = await prisma.social.update({
      where: {
        id: params.id,
      },
      data: {
        platform: finalPlatform,
        value,
      },
    })

    console.log('[SOCIALS-PUT-ID] Updated social:', updatedSocial);

    return NextResponse.json(updatedSocial)
  } catch (error) {
    console.error("Error updating social:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/user/socials/[id] - Delete a specific social media link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const session = await getServerSession(authOptions);
    console.log('[SOCIALS-DELETE-ID] Session:', session);
    console.log('[SOCIALS-DELETE-ID] UserId from params:', userId);
    
    let user = null;
    
    // Try to get user from session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      console.log('[SOCIALS-DELETE-ID] User found via session:', !!user, user?.email);
    }
    
    // If no user from session, try userId from params
    if (!user && userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
      console.log('[SOCIALS-DELETE-ID] User found via userId:', !!user, user?.id);
    }

    if (!user) {
      console.log('[SOCIALS-DELETE-ID] No user found');
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if social exists and belongs to user
    const existingSocial = await prisma.social.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingSocial) {
      return NextResponse.json({ error: "Social not found" }, { status: 404 })
    }

    // Delete the social
    await prisma.social.delete({
      where: {
        id: params.id,
      },
    });

    console.log('[SOCIALS-DELETE-ID] Deleted social:', params.id);

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting social:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 