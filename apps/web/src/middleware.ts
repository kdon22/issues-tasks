import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  
  // Allow API routes to pass through
  if (isApiRoute) {
    return NextResponse.next()
  }

  // If no session and not on auth page, redirect to login
  if (!session && !isAuthPage) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If has session and on auth page, redirect to workspace
  if (session && isAuthPage) {
    try {
      const sessionData = JSON.parse(session.value)
      const workspaceUrl = sessionData.workspace?.url
      if (workspaceUrl) {
        const redirectUrl = new URL(`/${workspaceUrl}/my-issues`, request.url)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error('Session parse error:', error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 