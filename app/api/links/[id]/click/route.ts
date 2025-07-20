import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

// Simple user agent parser
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase()
  
  // Device detection
  let device = 'desktop'
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) {
    device = 'mobile'
  } else if (ua.includes('tablet')) {
    device = 'tablet'
  }
  
  // OS detection
  let os = 'unknown'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac os')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'
  
  // Browser detection
  let browser = 'unknown'
  if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari'
  else if (ua.includes('edge')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'
  
  return { device, os, browser }
}

// Simple geo detection based on IP (for demo purposes)
// In production, you'd use a service like MaxMind or IP2Location
async function getGeoFromIP(ipAddress: string | null) {
  if (!ipAddress || ipAddress === 'unknown') {
    return { country: null, city: null }
  }
  
  try {
    // For demo purposes, we'll use a simple approach
    // In production, use a proper geo IP service
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=country,countryCode,city`)
    if (response.ok) {
      const data = await response.json()
      return {
        country: data.country || null,
        city: data.city || null
      }
    }
  } catch (error) {
    console.log('Geo IP lookup failed:', error)
  }
  
  return { country: null, city: null }
}

// POST /api/links/[id]/click - Track a link click
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Session für userId
    const session = await getServerSession(authOptions)
    
    // Header auslesen
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || null
    
    // Parse user agent for device, OS, and browser info
    const { device, os, browser } = parseUserAgent(userAgent)
    
    // Get geo information
    const { country, city } = await getGeoFromIP(ipAddress)
    
    // Generate session ID (simple hash of IP + User Agent)
    const sessionId = Buffer.from(`${ipAddress}-${userAgent}`).toString('base64').slice(0, 16)

    // Verify the link exists
    const link = await prisma.link.findUnique({
      where: { id: params.id },
      include: { user: { select: { id: true } } }
    })
    
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Create click record with enhanced analytics
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

    console.log('Link click tracked:', {
      linkId: params.id,
      linkTitle: link.title,
      userId: link.user.id,
      device,
      os,
      browser,
      country,
      city
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