import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOtpMail } from "@/lib/postmark";
import bcrypt from "bcryptjs";
import { withRateLimit, authRateLimiter } from "@/lib/rate-limit";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await withRateLimit(req, authRateLimiter);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email, password, username } = await req.json();
    console.log('[REGISTER] Request body:', { email, password, username });
    if (!email || !password || !username) {
      console.log('[REGISTER] Missing fields');
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const existing = await prisma.user.findFirst({ where: { OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] } });
    console.log('[REGISTER] Existing user:', existing);
    if (existing) {
      console.log('[REGISTER] User or username already exists');
      return NextResponse.json({ error: "User or username already exists" }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    let user = null;
    try {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashed,
          username: username.toLowerCase(),
          otp,
          otpExpires: new Date(Date.now() + 30 * 60 * 1000),
          isVerified: false,
        },
      });
      console.log('[REGISTER] User created:', user);
    } catch (err) {
      console.error('[REGISTER] Error creating user:', err);
      return NextResponse.json({ error: 'Error creating user', details: err instanceof Error ? err.message : err }, { status: 500 });
    }
    try {
      await sendOtpMail({ to: user.email, code: otp });
      console.log('[REGISTER] OTP mail sent');
    } catch (err) {
      console.error('[REGISTER] Error sending OTP mail:', err);
    }
    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('[REGISTER] General error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 