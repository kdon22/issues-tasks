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
  // Prevent multiple middleware executions
  if (request.headers.get('x-middleware-cache')) {
    return NextResponse.next()
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  }) as CustomToken | null
  
  // Only log on initial page load
  if (!request.headers.get('x-middleware-invoke')) {
    console.log('Middleware - Initial request:', request.nextUrl.pathname)
  }

  // Allow public file uploads
  if (request.nextUrl.pathname.startsWith('/api/upload')) {
    return NextResponse.next()
  }

  // Require auth
  if (!token && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If at root and has workspace, redirect to last workspace
  if (request.nextUrl.pathname === '/workspace/new' && token?.workspace?.url) {
    return NextResponse.redirect(new URL(`/${token.workspace.url}/my-issues`, request.url))
  }

  const response = NextResponse.next()
  response.headers.set('x-middleware-cache', '1')
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
    '/api/upload/:path*'
  ],
}