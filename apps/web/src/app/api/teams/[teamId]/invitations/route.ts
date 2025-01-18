import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/infrastructure/auth/config'
import { prisma } from '@/infrastructure/db/prisma'
import { nanoid } from 'nanoid'

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Get team's workspace
  const team = await prisma.team.findUnique({
    where: { id: params.teamId },
    select: { workspaceId: true }
  })

  if (!team) {
    return new NextResponse('Team not found', { status: 404 })
  }

  // Find invitations that include this team
  const invitations = await prisma.workspaceInvite.findMany({
    where: { 
      workspaceId: team.workspaceId,
      teamIds: { has: params.teamId },
      expiresAt: { gt: new Date() }
    }
  })

  return NextResponse.json(invitations)
}

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { email } = await request.json()

  // Get team's workspace
  const team = await prisma.team.findUnique({
    where: { id: params.teamId },
    select: { 
      workspaceId: true,
      name: true
    }
  })

  if (!team) {
    return new NextResponse('Team not found', { status: 404 })
  }

  // Create workspace invitation with team
  const invitation = await prisma.workspaceInvite.create({
    data: {
      code: nanoid(),
      email,
      workspaceId: team.workspaceId,
      invitedById: session.user.id,
      teamIds: [params.teamId],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    include: {
      workspace: true
    }
  })

  return NextResponse.json(invitation)
} 