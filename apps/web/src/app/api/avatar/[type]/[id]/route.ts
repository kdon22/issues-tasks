import { type NextRequest } from 'next/server'
import { avatarService } from '@/domains/shared/services/avatar'
import type { EntityType } from '@/domains/shared/components/Avatar/types'

export async function GET(
  req: NextRequest,
  { params }: { params: { type: EntityType; id: string } }
) {
  try {
    const avatar = await avatarService.get(params.type, params.id)
    return Response.json(avatar)
  } catch (error) {
    return new Response('Avatar not found', { status: 404 })
  }
} 