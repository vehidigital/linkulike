import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Clear any session cookies
    const response = NextResponse.json({ success: true });
    
    // Clear session cookies
    response.cookies.set('next-auth.session-token', '', {
      expires: new Date(0),
      path: '/',
    });
    
    response.cookies.set('__Secure-next-auth.session-token', '', {
      expires: new Date(0),
      path: '/',
      secure: true,
    });
    
    response.cookies.set('next-auth.csrf-token', '', {
      expires: new Date(0),
      path: '/',
    });
    
    response.cookies.set('__Host-next-auth.csrf-token', '', {
      expires: new Date(0),
      path: '/',
      secure: true,
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
} 