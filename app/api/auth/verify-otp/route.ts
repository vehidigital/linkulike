import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId, otp } = await req.json();
  if (!userId || !otp) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.otp !== otp || !user.otpExpires || new Date(user.otpExpires) < new Date()) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }
  await prisma.user.update({ where: { id: userId }, data: { isVerified: true, otp: null, otpExpires: null } });
  return NextResponse.json({ success: true });
} 