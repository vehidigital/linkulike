import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOtpMail } from "@/lib/postmark";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const otp = generateOtp();
  await prisma.user.update({ where: { id: userId }, data: { otp, otpExpires: new Date(Date.now() + 30 * 60 * 1000) } });
  await sendOtpMail({ to: user.email, code: otp });
  return NextResponse.json({ success: true });
} 