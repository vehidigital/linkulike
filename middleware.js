import { NextResponse } from "next/server"

export function middleware(req) {
  const { pathname, hostname } = req.nextUrl

  console.log('[MIDDLEWARE-DEBUG] Host:', hostname, 'Path:', pathname)

  let lang = 'en' // default
  
  // Spezialfall: de.localhost
  if (hostname === 'de.localhost' || hostname.startsWith('de.localhost')) {
    lang = 'de'
    console.log('[MIDDLEWARE-DEBUG] Setting lang to DE for de.localhost')
  }

  // Add language to request headers for use in components
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-lang', lang)

  console.log('[MIDDLEWARE-DEBUG] Final lang:', lang)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 