import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  if (!username || typeof username !== "string") {
    return NextResponse.json({ available: false, error: "No username provided" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
  return NextResponse.json({ available: !user });
} 