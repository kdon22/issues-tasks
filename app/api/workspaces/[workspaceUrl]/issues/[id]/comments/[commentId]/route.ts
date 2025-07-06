// Individual Comment API for Issues - Linear Clone
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { commentUpdateSchema } from '@/lib/validations/comment';

// PUT - Update a specific comment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceUrl: string; id: string; commentId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceUrl, id: issueId, commentId } = await params;
    const body = await request.json();

    // Validate the request body
    const validatedData = commentUpdateSchema.parse(body);

    // Find the workspace
    const workspace = await prisma.workspace.findUnique({
      where: { url: workspaceUrl },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Find the comment and verify ownership
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        issueId: issueId,
        userId: user.id!, // Only allow editing own comments
      },
      include: {
        issue: {
          include: {
            team: {
              include: {
                members: {
                  where: { userId: user.id! }
                }
              }
            }
          }
        }
      }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found or access denied' }, { status: 404 });
    }

    // Verify user has access to the issue
    if (comment.issue.team.members.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: validatedData.content,
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
      ...updatedComment,
      reactions: [], // TODO: Add reactions support
    };

    return NextResponse.json({ data: transformedComment });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a specific comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceUrl: string; id: string; commentId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceUrl, id: issueId, commentId } = await params;

    // Find the workspace
    const workspace = await prisma.workspace.findUnique({
      where: { url: workspaceUrl },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Find the comment and verify ownership
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        issueId: issueId,
        userId: user.id!, // Only allow deleting own comments
      },
      include: {
        issue: {
          include: {
            team: {
              include: {
                members: {
                  where: { userId: user.id! }
                }
              }
            }
          }
        }
      }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found or access denied' }, { status: 404 });
    }

    // Verify user has access to the issue
    if (comment.issue.team.members.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete the comment (this will also delete replies due to CASCADE)
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 