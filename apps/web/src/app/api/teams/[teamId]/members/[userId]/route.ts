import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/infrastructure/auth/config'
import { prisma } from '@/infrastructure/db/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { teamId: string; userId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { role } = await request.json()

  const member = await prisma.teamMember.update({
    where: {
      userId_teamId: {
        teamId: params.teamId,
        userId: params.userId
      }
    },
    data: { role },
    include: { user: true }
  })

  return NextResponse.json(member)
}

export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string; userId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  await prisma.teamMember.delete({
    where: {
      userId_teamId: {
        teamId: params.teamId,
        userId: params.userId
      }
    }
  })

  return new NextResponse(null, { status: 204 })
} 