import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')

  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    const parsed = JSON.parse(session.value)
    if (!parsed.workspace?.url) {
      // If no workspace in session, redirect to workspace selection
      return NextResponse.redirect(new URL('/workspace/select', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
} 