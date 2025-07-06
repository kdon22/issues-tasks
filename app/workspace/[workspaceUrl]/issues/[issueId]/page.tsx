import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { Sidebar } from '@/components/layout/sidebar';
import { IssueDetailView } from '@/components/issues/issue-detail-view';
import { IssueDetailHeader } from '@/components/issues/issue-detail-header';

interface IssueDetailPageProps {
  params: Promise<{
    workspaceUrl: string;
    issueId: string;
  }>;
}

export default async function IssueDetailPage({ params }: IssueDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return notFound();
  }

  const { workspaceUrl, issueId } = await params;

  // Get workspace
  const workspace = await prisma.workspace.findUnique({
    where: { url: workspaceUrl },
    include: {
      members: {
        where: { userId: session.user.id },
        take: 1,
      },
    },
  });

  if (!workspace || workspace.members.length === 0) {
    return notFound();
  }

  // Get the issue with all related data
  const issue = await prisma.issue.findUnique({
    where: { 
      id: issueId,
      workspaceId: workspace.id,
    },
    include: {
      parent: {
        select: {
          id: true,
          title: true,
          identifier: true,
          number: true,
          parent: {
            select: {
              id: true,
              title: true,
              identifier: true,
              number: true,
            },
          },
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
          avatarType: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
          avatarType: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
          identifier: true,
          avatarColor: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          identifier: true,
          color: true,
        },
      },
      state: {
        select: {
          id: true,
          name: true,
          color: true,
          type: true,
        },
      },
      issueType: {
        select: {
          id: true,
          name: true,
          icon: true,
        },
      },
      labels: {
        include: {
          label: {
            select: {
              id: true,
              name: true,
              color: true,
              description: true,
            },
          },
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarColor: true,
              avatarType: true,
            },
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
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      attachments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      children: {
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          state: {
            select: {
              id: true,
              name: true,
              color: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      activities: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarColor: true,
              avatarType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          comments: true,
          attachments: true,
          children: true,
        },
      },
    },
  });

  if (!issue) {
    return notFound();
  }

  // Get workspace members for assignee dropdown
  const workspaceMembers = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
          avatarType: true,
        },
      },
    },
  });

  // Get teams for team dropdown
  const teams = await prisma.team.findMany({
    where: { workspaceId: workspace.id },
    select: {
      id: true,
      name: true,
      identifier: true,
    },
  });

  // Get projects for project dropdown
  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    select: {
      id: true,
      name: true,
      identifier: true,
      color: true,
    },
  });

  // Get states for status dropdown
  const states = await prisma.state.findMany({
    where: { 
      statusFlow: {
        workspace: { id: workspace.id }
      }
    },
    select: {
      id: true,
      name: true,
      color: true,
      type: true,
    },
  });

  // Get issue types for subtask creation
  const issueTypes = await prisma.issueType.findMany({
    where: { workspaceId: workspace.id },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      description: true,
    },
  });

  // Serialize dates for client component
  const serializedIssue = {
    ...issue,
    dueDate: issue.dueDate ? issue.dueDate.toISOString() : null,
    startedAt: issue.startedAt ? issue.startedAt.toISOString() : null,
    completedAt: issue.completedAt ? issue.completedAt.toISOString() : null,
    canceledAt: issue.canceledAt ? issue.canceledAt.toISOString() : null,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
    comments: issue.comments.map(comment => ({
      ...comment,
      reactions: [],
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      replies: comment.replies?.map(reply => ({
        ...reply,
        reactions: [],
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
      })) || [],
    })),
    attachments: issue.attachments.map(attachment => ({
      ...attachment,
      createdAt: attachment.createdAt.toISOString(),
    })),
    children: issue.children.map(child => ({
      ...child,
      createdAt: child.createdAt.toISOString(),
    })),
    activities: issue.activities.map(activity => ({
      ...activity,
      createdAt: activity.createdAt.toISOString(),
    })),
  } as any; // Type assertion to resolve TypeScript conflicts

  return (
    <AppShell 
      sidebar={<Sidebar />}
      header={
        <IssueDetailHeader 
          issue={serializedIssue}
          workspaceUrl={workspace.url}
        />
      }
    >
      <IssueDetailView
        issue={serializedIssue}
        workspace={workspace}
        members={workspaceMembers}
        teams={teams}
        projects={projects}
        states={states}
        issueTypes={issueTypes}
        currentUserId={session.user.id}
      />
    </AppShell>
  );
} 