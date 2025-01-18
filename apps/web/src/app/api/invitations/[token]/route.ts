import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/infrastructure/auth/config'
import { prisma } from '@/infrastructure/db/prisma'

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const invitation = await prisma.workspaceInvite.findUnique({
    where: { code: params.token }
  })

  if (!invitation) {
    return new NextResponse('Invitation not found', { status: 404 })
  }

  if (invitation.expiresAt < new Date()) {
    return new NextResponse('Invitation expired', { status: 400 })
  }

  // Create workspace member
  const workspaceMember = await prisma.workspaceMember.create({
    data: {
      workspaceId: invitation.workspaceId,
      userId: session.user.id,
      role: invitation.role
    }
  })

  // Create team members for each team in the invitation
  if (invitation.teamIds.length > 0) {
    await prisma.teamMember.createMany({
      data: invitation.teamIds.map(teamId => ({
        teamId,
        userId: session.user.id,
        role: 'MEMBER'
      }))
    })
  }

  // Delete invitation
  await prisma.workspaceInvite.delete({
    where: { id: invitation.id }
  })

  return NextResponse.json({
    workspaceMember,
    teamIds: invitation.teamIds
  })
} 