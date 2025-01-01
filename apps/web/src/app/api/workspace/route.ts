import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const sessionCookie = cookies().get('session')
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const user = JSON.parse(sessionCookie.value)
    const workspace = await prisma.workspaceMember.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        workspace: true,
      },
    })

    if (!workspace) {
      return NextResponse.redirect(new URL('/workspace', request.url))
    }

    return NextResponse.redirect(new URL(`/${workspace.workspace.url}`, request.url))
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.redirect(new URL('/workspace', request.url))
  }
} 