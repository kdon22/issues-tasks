import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/infrastructure/auth/config'
import { prisma } from '@/infrastructure/db/prisma'

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
    data: {
      settings: data
    }
  })

  return NextResponse.json(team.settings)
} 