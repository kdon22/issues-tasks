// Comments API for Issues - Linear Clone (DRY with Reaction Factory)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { commentCreateSchema } from '@/lib/validations/comment';

// Import DRY reaction helper - same logic as reaction factory
async function getCommentsWithReactions(commentIds: string[], userId: string) {
  // Get all reactions for these comments
  const reactions = await (prisma as any).commentReaction.findMany({
    where: { 
      commentId: { in: commentIds } 
    },
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

  // Group reactions by comment and emoji (DRY grouping logic)
  const reactionsByComment = reactions.reduce((acc: Record<string, any>, reaction: any) => {
    const commentId = reaction.commentId;
    if (!acc[commentId]) {
      acc[commentId] = {};
    }
    
    if (!acc[commentId][reaction.emoji]) {
      acc[commentId][reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        hasReacted: false
      };
    }
    
    acc[commentId][reaction.emoji].count++;
    acc[commentId][reaction.emoji].users.push(reaction.user);
    
    if (reaction.userId === userId) {
      acc[commentId][reaction.emoji].hasReacted = true;
    }
    
    return acc;
  }, {});

  return reactionsByComment;
}

// GET - Get all comments for an issue
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceUrl: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceUrl, id: issueId } = await params;

    // Find the workspace
    const workspace = await prisma.workspace.findUnique({
      where: { url: workspaceUrl },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Find the issue and verify access
    const issue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        workspaceId: workspace.id,
        team: {
          members: {
            some: { userId: user.id! }
          }
        }
      },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Get comments with nested replies
    const comments = await prisma.comment.findMany({
      where: {
        issueId: issueId,
        parentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarColor: true,
            avatarType: true,
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarColor: true,
                avatarType: true,
              }
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get all comment IDs (including replies) for reactions
    const allCommentIds = comments.flatMap(comment => [
      comment.id,
      ...comment.replies.map(reply => reply.id)
    ]);

    // Get reactions for all comments (DRY approach)
    const reactionsByComment = await getCommentsWithReactions(allCommentIds, user.id!);

    // Transform comments to include reactions
    const transformedComments = comments.map(comment => ({
      ...comment,
      reactions: Object.values(reactionsByComment[comment.id] || {}),
      replies: comment.replies.map(reply => ({
        ...reply,
        reactions: Object.values(reactionsByComment[reply.id] || {}),
      }))
    }));

    return NextResponse.json({ comments: transformedComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceUrl: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceUrl, id: issueId } = await params;
    const body = await request.json();

    // Validate the request body
    const validatedData = commentCreateSchema.parse(body);

    // Find the workspace
    const workspace = await prisma.workspace.findUnique({
      where: { url: workspaceUrl },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Find the issue and verify access
    const issue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        workspaceId: workspace.id,
        team: {
          members: {
            some: { userId: user.id! }
          }
        }
      },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // If parentId is provided, verify the parent comment exists
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentComment || parentComment.issueId !== issueId) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        userId: user.id!,
        issueId: issueId,
        parentId: validatedData.parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarColor: true,
            avatarType: true,
          }
        },
      },
    });

    // Transform comment to include reactions (empty for now)
    const transformedComment = {
      ...comment,
      reactions: [], // TODO: Add reactions support
    };

    return NextResponse.json({ data: transformedComment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 