import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/auth/login',
    }
  }
)

export const config = {
  matcher: [
    // Add your protected routes here
    '/dashboard/:path*',
    '/workspace/:path*',
    // Don't protect auth routes
    '/((?!auth|api|_next/static|_next/image|favicon.ico).*)',
  ]
} 