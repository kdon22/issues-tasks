import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from './lib/auth'

export async function middleware(request: NextRequest) {
  const session = await getSession()

  // If session exists but is close to expiry, refresh it
  if (session) {
    const sessionCookie = request.cookies.get('session')
    if (sessionCookie) {
      const expiresAt = new Date(sessionCookie.expires || 0)
      const hourBeforeExpiry = new Date(expiresAt.getTime() - 60 * 60 * 1000)

      if (new Date() > hourBeforeExpiry) {
        const response = NextResponse.next()
        response.cookies.set('session', JSON.stringify(session), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        return response
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 