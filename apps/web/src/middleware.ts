import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { Workspace } from '@prisma/client'

interface CustomToken {
  name?: string | null
  email?: string | null
  sub?: string
  id: string
  workspace?: Workspace | null
  iat?: number
  exp?: number
  jti?: string
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  }) as CustomToken | null
  
  console.log('Middleware - Path:', request.nextUrl.pathname)
  console.log('Middleware - Token:', token)

  // Allow public file uploads
  if (request.nextUrl.pathname.startsWith('/api/upload')) {
    console.log('Middleware - Allowing upload')
    return NextResponse.next()
  }

  // Require auth
  if (!token && !request.nextUrl.pathname.startsWith('/auth')) {
    console.log('Middleware - No token, redirecting to login')
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If at root and has workspace, redirect to last workspace
  if (request.nextUrl.pathname === '/workspace/new' && token?.workspace?.url) {
    console.log('Middleware - Has workspace, redirecting to:', token.workspace.url)
    return NextResponse.redirect(new URL(`/${token.workspace.url}/my-issues`, request.url))
  }

  console.log('Middleware - Continuing to:', request.nextUrl.pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
    '/api/upload/:path*'
  ],
} 