import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/infrastructure/auth/config'
import { prisma } from '@/infrastructure/db/prisma'
import { getAvatarString } from '@/domains/shared/utils/getAvatarString'
import { TeamRole } from '@prisma/client'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { name, identifier, workspaceUrl } = await request.json()

  const workspace = await prisma.workspace.findUnique({
    where: { url: workspaceUrl }
  })

  if (!workspace) {
    return new NextResponse('Workspace not found', { status: 404 })
  }

  const team = await prisma.team.create({
    data: {
      name,
      identifier: identifier.toUpperCase(),
      workspaceId: workspace.id,
      members: {
        create: {
          userId: session.user.id,
          role: TeamRole.ADMIN
        }
      }
    },
    include: {
      _count: {
        select: { members: true }
      }
    }
  })

  // Transform team data
  const transformedTeam = {
    ...team,
    avatar: {
      type: team.avatarType,
      value: getAvatarString(team),
      name: team.name,
      color: team.avatarColor || '#000000'
    }
  }

  return NextResponse.json(transformedTeam)
} 