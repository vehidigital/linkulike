import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Register-API: Request-Body', body)
    const { email, password, username } = body

    // Validation
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, password, and username are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    })

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        username: username.toLowerCase(),
        displayName: username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    })
    console.log('Register-API: User created', user)

    // E-Mail-Verifizierung anlegen
    const emailToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h gültig
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: emailToken,
        expiresAt,
        status: 'pending',
      }
    })

    // Consent für Datenschutz/AGB anlegen
    await prisma.consent.create({
      data: {
        userId: user.id,
        type: 'privacy',
        acceptedAt: new Date(),
        version: '1.0',
      }
    })
    await prisma.consent.create({
      data: {
        userId: user.id,
        type: 'terms',
        acceptedAt: new Date(),
        version: '1.0',
      }
    })

    // OptIn für Systemmails (Beispiel)
    await prisma.optIn.create({
      data: {
        userId: user.id,
        type: 'system',
        status: 'subscribed',
        timestamp: new Date(),
      }
    })

    return NextResponse.json(
      { 
        message: "User created successfully",
        user 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 