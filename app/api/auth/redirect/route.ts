import { NextRequest, NextResponse } from "next/server"
import { getAuthRedirect } from "@/lib/auth-options"

export async function GET(request: NextRequest) {
  try {
    const redirectPath = await getAuthRedirect()
    return NextResponse.json({ redirect: redirectPath })
  } catch (error) {
    console.error("Auth redirect error:", error)
    return NextResponse.json({ redirect: "/login" })
  }
} 