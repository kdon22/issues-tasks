import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/infrastructure/auth/config'
import { prisma } from '@/infrastructure/db/prisma'
import { TeamRole } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const members = await prisma.teamMember.findMany({
    where: { teamId: params.teamId },
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
  })

  return NextResponse.json(members)
}

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { userId, role } = await request.json()

  if (!Object.values(TeamRole).includes(role)) {
    return new NextResponse('Invalid role', { status: 400 })
  }

  const member = await prisma.teamMember.create({
    data: {
      teamId: params.teamId,
      userId,
      role
    },
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
  })

  return NextResponse.json(member)
} 