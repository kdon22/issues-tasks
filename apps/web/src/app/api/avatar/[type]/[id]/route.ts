import { avatarService } from '@/lib/services/avatar'

export async function GET(
  req: Request,
  { params }: { params: { type: 'user' | 'team' | 'workspace'; id: string } }
) {
  const avatar = await avatarService.get(params.type, params.id)
  return Response.json(avatar)
} 