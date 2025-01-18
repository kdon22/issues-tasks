import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/infrastructure/auth/config'
import { prisma } from '@/infrastructure/db/prisma'
import { getAvatarString } from '@/domains/shared/utils/getAvatarString'

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const team = await prisma.team.findUnique({
    where: { id: params.teamId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarType: true,
              avatarColor: true,
              avatarIcon: true,
              avatarEmoji: true,
              avatarImageUrl: true
            }
          }
        }
      },
      _count: {
        select: { members: true }
      }
    }
  })

  if (!team) {
    return new NextResponse('Team not found', { status: 404 })
  }

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

export async function PATCH(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const data = await request.json()
  const team = await prisma.team.update({
    where: { id: params.teamId },
    data,
    include: {
      _count: {
        select: { members: true }
      }
    }
  })

  return NextResponse.json(team)
}

export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  await prisma.team.delete({
    where: { id: params.teamId }
  })

  return new NextResponse(null, { status: 204 })
} 