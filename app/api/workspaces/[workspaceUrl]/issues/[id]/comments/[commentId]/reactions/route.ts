// Reactions API Route - Using DRY Reaction Factory (Platinum Standard)
import { createReactionToggleHandler } from '@/lib/api/reaction-factory';

const handler = createReactionToggleHandler();

export async function GET(
  request: Request,
  params: { params: Promise<{ workspaceUrl: string; id: string; commentId: string }> }
) {
  return handler(request as any, params);
}

export async function POST(
  request: Request,
  params: { params: Promise<{ workspaceUrl: string; id: string; commentId: string }> }
) {
  return handler(request as any, params);
} 