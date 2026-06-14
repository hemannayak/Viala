import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}

export async function middleware(request: NextRequest) {
  // In development, avoid middleware auth checks to prevent redirect loops.
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')?.value

  // If not authenticated, redirect to login
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Role checks are enforced server-side (API routes) and via UI guards.
  // Middleware only ensures a session cookie exists.
  return NextResponse.next()
}
