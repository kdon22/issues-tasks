import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth.config'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Get all workspaces for the user, ordered by last accessed
    const workspaceMemberships = await prisma.workspaceMember.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        workspace: true,
      },
      orderBy: {
        updatedAt: 'desc' // This assumes you track when the workspace was last accessed
      }
    })

    if (!workspaceMemberships.length) {
      return NextResponse.redirect(new URL('/workspace/new', request.url))
    }

    // Get last accessed workspace from localStorage or use the most recently accessed one
    const lastWorkspaceUrl = workspaceMemberships[0].workspace.url
    
    return NextResponse.redirect(new URL(`/${lastWorkspaceUrl}/my-issues`, request.url))
  } catch (error) {
    console.error('Workspace redirect error:', error)
    return NextResponse.redirect(new URL('/workspace/new', request.url))
  }
} 