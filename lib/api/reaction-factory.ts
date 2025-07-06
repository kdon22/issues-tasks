// Reaction Factory - Absolute Platinum Standard DRY Implementation
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from './types';

interface ReactionApiResponse {
  reactions: {
    emoji: string;
    count: number;
    users: {
      id: string;
      name: string | null;
      email: string;
    }[];
    hasReacted: boolean;
  }[];
}

interface ReactionToggleRequest {
  emoji: string;
}

// Create reaction toggle handler (maximum DRY)
export function createReactionToggleHandler() {
  return async (
    request: NextRequest,
    { params }: { params: Promise<{ workspaceUrl: string; id: string; commentId: string }> }
  ) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { workspaceUrl, id: issueId, commentId } = await params;
      
      // Verify workspace access (DRY helper)
      const workspace = await verifyWorkspaceAccess(workspaceUrl, session.user.id);
      if (!workspace) {
        return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 404 });
      }

      // Verify comment exists and belongs to issue (DRY helper)
      const comment = await verifyCommentAccess(commentId, issueId, workspace.id);
      if (!comment) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }

      if (request.method === 'GET') {
        // Get grouped reactions (DRY helper)
        const reactions = await getGroupedReactions(commentId, session.user.id);
        return NextResponse.json({ reactions });
      }

      if (request.method === 'POST') {
        const body = await request.json();
        const { emoji } = body as ReactionToggleRequest;
        
        if (!emoji || typeof emoji !== 'string') {
          return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });
        }

        // Toggle reaction (DRY helper)
        await toggleReaction(commentId, session.user.id, emoji);
        
        // Return updated reactions (DRY helper)
        const reactions = await getGroupedReactions(commentId, session.user.id);
        return NextResponse.json({ reactions });
      }

      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    } catch (error) {
      console.error('Reaction API error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

// DRY Helper Functions (Maximum Reusability)

async function verifyWorkspaceAccess(workspaceUrl: string, userId: string) {
  return await prisma.workspace.findFirst({
    where: {
      url: workspaceUrl,
      members: {
        some: { userId }
      }
    },
    select: { id: true }
  });
}

async function verifyCommentAccess(commentId: string, issueId: string, workspaceId: string) {
  return await prisma.comment.findFirst({
    where: {
      id: commentId,
      issue: {
        id: issueId,
        team: {
          workspaceId
        }
      }
    },
    select: { id: true }
  });
}

async function getGroupedReactions(commentId: string, userId: string) {
  const reactions = await (prisma as any).commentReaction.findMany({
    where: { commentId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  // Group reactions by emoji (DRY grouping logic)
  const groupedReactions = reactions.reduce((acc: Record<string, ReactionApiResponse['reactions'][0]>, reaction: any) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        hasReacted: false
      };
    }
    
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user);
    
    if (reaction.userId === userId) {
      acc[reaction.emoji].hasReacted = true;
    }
    
    return acc;
  }, {} as Record<string, ReactionApiResponse['reactions'][0]>);

  return Object.values(groupedReactions);
}

async function toggleReaction(commentId: string, userId: string, emoji: string) {
  const existingReaction = await (prisma as any).commentReaction.findFirst({
    where: {
      commentId,
      userId,
      emoji
    }
  });

  if (existingReaction) {
    // Remove reaction
    await (prisma as any).commentReaction.delete({
      where: { id: existingReaction.id }
    });
  } else {
    // Add reaction
    await (prisma as any).commentReaction.create({
      data: {
        commentId,
        userId,
        emoji
      }
    });
  }
} 