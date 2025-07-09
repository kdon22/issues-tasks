import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Action request schema
const actionRequestSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  parentId: z.string().optional(),
  data: z.record(z.any()).optional(),
  options: z.object({
    include: z.array(z.string()).optional(),
    optimistic: z.boolean().optional().default(true),
    skipCache: z.boolean().optional().default(false)
  }).optional().default({})
});

// Action response interface
interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  optimisticId?: string;
  timestamp: number;
  action: string;
}

// Ultra-fast single action endpoint
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceUrl: string }> }
): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ActionResponse>({
        success: false,
        error: 'Unauthorized',
        timestamp: Date.now(),
        action: 'unknown'
      }, { status: 401 });
    }

    const { workspaceUrl } = await params;
    const body = await request.json();
    
    // Validate request
    const { action, resourceType, resourceId, parentId, data, options } = actionRequestSchema.parse(body);

    // Get workspace context
    const workspace = await prisma.workspace.findFirst({
      where: { 
        url: workspaceUrl,
        members: { some: { userId: session.user.id } }
      },
      select: { id: true, name: true }
    });

    if (!workspace) {
      return NextResponse.json<ActionResponse>({
        success: false,
        error: 'Workspace not found or access denied',
        timestamp: Date.now(),
        action
      }, { status: 404 });
    }

    // Route to specific action handlers
    const result = await handleAction({
      action,
      resourceType,
      resourceId,
      parentId,
      data: data || {},
      options: options || {},
      context: {
        userId: session.user.id,
        workspace,
        request
      }
    });

    const response: ActionResponse = {
      success: true,
      data: result,
      timestamp: Date.now(),
      action,
      optimisticId: options?.optimistic ? `temp-${Date.now()}` : undefined
    };

    // Add performance headers
    const processingTime = Date.now() - startTime;
    const responseObj = NextResponse.json(response);
    responseObj.headers.set('X-Processing-Time', `${processingTime}ms`);
    responseObj.headers.set('X-Action', action);
    
    return responseObj;

  } catch (error: any) {
    console.error('Action endpoint error:', error);
    
    return NextResponse.json<ActionResponse>({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: Date.now(),
      action: 'unknown'
    }, { status: 500 });
  }
}

// Action context interface
interface ActionContext {
  userId: string;
  workspace: { id: string; name: string };
  request: NextRequest;
}

// Main action dispatcher - ultra-fast switch statement
async function handleAction({
  action,
  resourceType,
  resourceId,
  parentId,
  data,
  options,
  context
}: {
  action: string;
  resourceType?: string;
  resourceId?: string;
  parentId?: string;
  data: Record<string, any>;
  options: Record<string, any>;
  context: ActionContext;
}): Promise<any> {
  
  // Resource CRUD actions
  switch (action) {
    // Team actions
    case 'team.create': return createTeam(data, context);
    case 'team.update': return updateTeam(resourceId!, data, context);
    case 'team.delete': return deleteTeam(resourceId!, context);
    case 'team.list': return listTeams(context);
    case 'team.get': return getTeam(resourceId!, context);

    // Project actions
    case 'project.create': return createProject(data, context);
    case 'project.update': return updateProject(resourceId!, data, context);
    case 'project.delete': return deleteProject(resourceId!, context);
    case 'project.list': return listProjects(context);
    case 'project.get': return getProject(resourceId!, context);

    // Label actions
    case 'label.create': return createLabel(data, context);
    case 'label.update': return updateLabel(resourceId!, data, context);
    case 'label.delete': return deleteLabel(resourceId!, context);
    case 'label.list': return listLabels(context);
    case 'label.get': return getLabel(resourceId!, context);

    // Member actions
    case 'member.create': return createMember(data, context);
    case 'member.update': return updateMember(resourceId!, data, context);
    case 'member.delete': return deleteMember(resourceId!, context);
    case 'member.list': return listMembers(context);
    case 'member.get': return getMember(resourceId!, context);

    // Issue Type actions
    case 'issueType.create': return createIssueType(data, context);
    case 'issueType.update': return updateIssueType(resourceId!, data, context);
    case 'issueType.delete': return deleteIssueType(resourceId!, context);
    case 'issueType.list': return listIssueTypes(context);
    case 'issueType.get': return getIssueType(resourceId!, context);

    // Status Flow actions
    case 'statusFlow.create': return createStatusFlow(data, context);
    case 'statusFlow.update': return updateStatusFlow(resourceId!, data, context);
    case 'statusFlow.delete': return deleteStatusFlow(resourceId!, context);
    case 'statusFlow.list': return listStatusFlows(context);
    case 'statusFlow.get': return getStatusFlow(resourceId!, context);

    // Field Set actions
    case 'fieldSet.create': return createFieldSet(data, context);
    case 'fieldSet.update': return updateFieldSet(resourceId!, data, context);
    case 'fieldSet.delete': return deleteFieldSet(resourceId!, context);
    case 'fieldSet.list': return listFieldSets(context);
    case 'fieldSet.get': return getFieldSet(resourceId!, context);

    // State actions
    case 'state.create': return createState(data, context);
    case 'state.update': return updateState(resourceId!, data, context);
    case 'state.delete': return deleteState(resourceId!, context);
    case 'state.list': return listStates(context);
    case 'state.get': return getState(resourceId!, context);

    // Issue actions (new resources)
    case 'issue.create': return createIssue(data, context);
    case 'issue.update': return updateIssue(resourceId!, data, context);
    case 'issue.delete': return deleteIssue(resourceId!, context);
    case 'issue.list': return listIssues(context);
    case 'issue.get': return getIssue(resourceId!, context);

    // Comment actions (hierarchical)
    case 'comment.create': return createComment(data, context);
    case 'comment.update': return updateComment(resourceId!, data, context);
    case 'comment.delete': return deleteComment(resourceId!, context);
    case 'comment.list': return listComments(parentId!, context);

    // Reaction actions (hierarchical)
    case 'reaction.create': return createReaction(data, context);
    case 'reaction.delete': return deleteReaction(resourceId!, context);
    case 'reaction.list': return listReactions(parentId!, context);

    // Bulk actions
    case 'bulk.delete': return bulkDelete(resourceType!, data.ids, context);
    case 'bulk.update': return bulkUpdate(resourceType!, data.ids, data.updates, context);

    // Workspace Bootstrap - Load everything at once (Linear-style)
    case 'workspace.bootstrap': return bootstrapWorkspace(context);

    default:
      // Handle dynamic actions like issueType.{id}.states
      if (action.startsWith('issueType.') && action.endsWith('.states')) {
        const issueTypeId = action.split('.')[1];
        return getStatesForIssueType(issueTypeId, context);
      }
      
      // Handle dynamic actions like fieldSet.{id}.configurations
      if (action.startsWith('fieldSet.') && action.endsWith('.configurations')) {
        const fieldSetId = action.split('.')[1];
        return getFieldSetConfigurations(fieldSetId, context);
      }

      throw new Error(`Unknown action: ${action}`);
  }
}

// Bootstrap entire workspace data (Linear-style full download)
async function bootstrapWorkspace(context: ActionContext) {
  const startTime = Date.now();
  
  // Fetch all workspace data in parallel
  const [teams, projects, labels, members, issueTypes, states, issues] = await Promise.all([
    listTeams(context),
    listProjects(context),
    listLabels(context),
    listMembers(context),
    listIssueTypes(context),
    listStates(context),
    listIssues(context) // This already includes full relations
  ]);

  // Also fetch all comments for all issues
  const allComments = await prisma.comment.findMany({
    where: {
      issue: {
        workspaceId: context.workspace.id
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      parent: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      },
      reactions: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  const loadTime = Date.now() - startTime;
  
  return {
    workspace: context.workspace,
    teams,
    projects,
    labels,
    members,
    issueTypes,
    states,
    issues,
    comments: allComments,
    meta: {
      bootstrapTime: loadTime,
      timestamp: Date.now(),
      totalRecords: {
        teams: teams.length,
        projects: projects.length,
        labels: labels.length,
        members: members.length,
        issueTypes: issueTypes.length,
        states: states.length,
        issues: issues.length,
        comments: allComments.length
      }
    }
  };
}

// Team actions
async function createTeam(data: any, context: ActionContext) {
  return await prisma.team.create({
    data: {
      ...data,
      workspaceId: context.workspace.id,
    }
  });
}

async function updateTeam(id: string, data: any, context: ActionContext) {
  return await prisma.team.update({
    where: { id, workspaceId: context.workspace.id },
    data
  });
}

async function deleteTeam(id: string, context: ActionContext) {
  await prisma.team.delete({
    where: { id, workspaceId: context.workspace.id }
  });
  return { success: true };
}

async function listTeams(context: ActionContext) {
  return await prisma.team.findMany({
    where: { workspaceId: context.workspace.id },
    orderBy: { createdAt: 'desc' }
  });
}

async function getTeam(id: string, context: ActionContext) {
  return await prisma.team.findFirst({
    where: { id, workspaceId: context.workspace.id }
  });
}

// Project actions
async function createProject(data: any, context: ActionContext) {
  return await prisma.project.create({
    data: {
      ...data,
      workspaceId: context.workspace.id,
    }
  });
}

async function updateProject(id: string, data: any, context: ActionContext) {
  return await prisma.project.update({
    where: { id, workspaceId: context.workspace.id },
    data
  });
}

async function deleteProject(id: string, context: ActionContext) {
  await prisma.project.delete({
    where: { id, workspaceId: context.workspace.id }
  });
  return { success: true };
}

async function listProjects(context: ActionContext) {
  return await prisma.project.findMany({
    where: { workspaceId: context.workspace.id },
    orderBy: { createdAt: 'desc' }
  });
}

async function getProject(id: string, context: ActionContext) {
  return await prisma.project.findFirst({
    where: { id, workspaceId: context.workspace.id }
  });
}

// Label actions
async function createLabel(data: any, context: ActionContext) {
  return await prisma.label.create({
    data: {
      ...data,
      workspaceId: context.workspace.id,
    }
  });
}

async function updateLabel(id: string, data: any, context: ActionContext) {
  return await prisma.label.update({
    where: { id, workspaceId: context.workspace.id },
    data
  });
}

async function deleteLabel(id: string, context: ActionContext) {
  await prisma.label.delete({
    where: { id, workspaceId: context.workspace.id }
  });
  return { success: true };
}

async function listLabels(context: ActionContext) {
  return await prisma.label.findMany({
    where: { workspaceId: context.workspace.id },
    orderBy: { createdAt: 'desc' }
  });
}

async function getLabel(id: string, context: ActionContext) {
  return await prisma.label.findFirst({
    where: { id, workspaceId: context.workspace.id }
  });
}

// Member actions
async function createMember(data: any, context: ActionContext) {
  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name || data.email,
        password: `temp-${Date.now()}`,
        status: 'PENDING'
      }
    });
  }

  return await prisma.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId: context.workspace.id,
      role: data.role || 'MEMBER'
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true
        }
      }
    }
  });
}

async function updateMember(id: string, data: any, context: ActionContext) {
  return await prisma.workspaceMember.update({
    where: { 
      userId_workspaceId: {
        userId: id,
        workspaceId: context.workspace.id
      }
    },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true
        }
      }
    }
  });
}

async function deleteMember(id: string, context: ActionContext) {
  await prisma.workspaceMember.delete({
    where: { 
      userId_workspaceId: {
        userId: id,
        workspaceId: context.workspace.id
      }
    }
  });
  return { success: true };
}

async function listMembers(context: ActionContext) {
  return await prisma.workspaceMember.findMany({
    where: { workspaceId: context.workspace.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function getMember(id: string, context: ActionContext) {
  return await prisma.workspaceMember.findFirst({
    where: { 
      userId: id,
      workspaceId: context.workspace.id
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true
        }
      }
    }
  });
}

// Issue Type actions
async function createIssueType(data: any, context: ActionContext) {
  return await prisma.issueType.create({
    data: {
      ...data,
      workspaceId: context.workspace.id,
    }
  });
}

async function updateIssueType(id: string, data: any, context: ActionContext) {
  return await prisma.issueType.update({
    where: { id, workspaceId: context.workspace.id },
    data
  });
}

async function deleteIssueType(id: string, context: ActionContext) {
  await prisma.issueType.delete({
    where: { id, workspaceId: context.workspace.id }
  });
  return { success: true };
}

async function listIssueTypes(context: ActionContext) {
  return await prisma.issueType.findMany({
    where: { workspaceId: context.workspace.id },
    orderBy: { createdAt: 'desc' }
  });
}

async function getIssueType(id: string, context: ActionContext) {
  return await prisma.issueType.findFirst({
    where: { id, workspaceId: context.workspace.id }
  });
}

// State actions
async function createState(data: any, context: ActionContext) {
  return await prisma.state.create({
    data: {
      ...data,
      // statusFlowId should be provided in data
    },
    include: {
      statusFlow: true
    }
  });
}

async function updateState(id: string, data: any, context: ActionContext) {
  return await prisma.state.update({
    where: { 
      id,
      statusFlow: {
        workspaceId: context.workspace.id
      }
    },
    data,
    include: {
      statusFlow: true
    }
  });
}

async function deleteState(id: string, context: ActionContext) {
  await prisma.state.delete({
    where: { 
      id,
      statusFlow: {
        workspaceId: context.workspace.id
      }
    }
  });
  return { success: true };
}

async function listStates(context: ActionContext) {
  return await prisma.state.findMany({
    where: { 
      statusFlow: {
        workspaceId: context.workspace.id
      }
    },
    include: {
      statusFlow: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function getState(id: string, context: ActionContext) {
  return await prisma.state.findFirst({
    where: { 
      id,
      statusFlow: {
        workspaceId: context.workspace.id
      }
    },
    include: {
      statusFlow: true
    }
  });
}

// Issue actions
async function createIssue(data: any, context: ActionContext) {
  // Get the team to generate the issue number
  const team = await prisma.team.findFirst({
    where: { id: data.teamId, workspaceId: context.workspace.id }
  });
  
  if (!team) {
    throw new Error('Team not found');
  }

  // Get the next issue number for this team
  const lastIssue = await prisma.issue.findFirst({
    where: { teamId: data.teamId },
    orderBy: { number: 'desc' }
  });

  const nextNumber = (lastIssue?.number || 0) + 1;
  const identifier = `${team.identifier}-${nextNumber}`;

  return await prisma.issue.create({
    data: {
      ...data,
      identifier,
      number: nextNumber,
      workspaceId: context.workspace.id,
      creatorId: context.userId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          identifier: true,
        }
      },
      project: {
        select: {
          id: true,
          name: true,
          identifier: true,
          color: true,
        }
      },
      state: {
        select: {
          id: true,
          name: true,
          color: true,
          type: true,
        }
      },
      issueType: {
        select: {
          id: true,
          name: true,
          icon: true,
        }
      },
      labels: {
        include: {
          label: {
            select: {
              id: true,
              name: true,
              color: true,
              description: true,
            }
          }
        }
      },
      _count: {
        select: {
          comments: true,
          attachments: true,
        }
      }
    }
  });
}

async function updateIssue(id: string, data: any, context: ActionContext) {
  return await prisma.issue.update({
    where: { id, workspaceId: context.workspace.id },
    data,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          identifier: true,
        }
      },
      project: {
        select: {
          id: true,
          name: true,
          identifier: true,
          color: true,
        }
      },
      state: {
        select: {
          id: true,
          name: true,
          color: true,
          type: true,
        }
      },
      issueType: {
        select: {
          id: true,
          name: true,
          icon: true,
        }
      },
      labels: {
        include: {
          label: {
            select: {
              id: true,
              name: true,
              color: true,
              description: true,
            }
          }
        }
      },
      _count: {
        select: {
          comments: true,
          attachments: true,
        }
      }
    }
  });
}

async function deleteIssue(id: string, context: ActionContext) {
  await prisma.issue.delete({
    where: { id, workspaceId: context.workspace.id }
  });
  return { success: true };
}

async function listIssues(context: ActionContext) {
  return await prisma.issue.findMany({
    where: { workspaceId: context.workspace.id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          identifier: true,
        }
      },
      project: {
        select: {
          id: true,
          name: true,
          identifier: true,
          color: true,
        }
      },
      state: {
        select: {
          id: true,
          name: true,
          color: true,
          type: true,
        }
      },
      issueType: {
        select: {
          id: true,
          name: true,
          icon: true,
        }
      },
      labels: {
        include: {
          label: {
            select: {
              id: true,
              name: true,
              color: true,
              description: true,
            }
          }
        }
      },
      _count: {
        select: {
          comments: true,
          attachments: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function getIssue(id: string, context: ActionContext) {
  return await prisma.issue.findFirst({
    where: { id, workspaceId: context.workspace.id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          identifier: true,
        }
      },
      project: {
        select: {
          id: true,
          name: true,
          identifier: true,
          color: true,
        }
      },
      state: {
        select: {
          id: true,
          name: true,
          color: true,
          type: true,
        }
      },
      issueType: {
        select: {
          id: true,
          name: true,
          icon: true,
        }
      },
      labels: {
        include: {
          label: {
            select: {
              id: true,
              name: true,
              color: true,
              description: true,
            }
          }
        }
      },
      _count: {
        select: {
          comments: true,
          attachments: true,
        }
      }
    }
  });
}

// Comment actions
async function createComment(data: any, context: ActionContext) {
  // Verify the issue exists and belongs to the workspace
  const issue = await prisma.issue.findFirst({
    where: { id: data.issueId, workspaceId: context.workspace.id }
  });
  
  if (!issue) {
    throw new Error('Issue not found');
  }

  return await prisma.comment.create({
    data: {
      ...data,
      userId: context.userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      parent: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      },
      reactions: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      }
    }
  });
}

async function updateComment(id: string, data: any, context: ActionContext) {
  return await prisma.comment.update({
    where: { 
      id,
      issue: {
        workspaceId: context.workspace.id
      }
    },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      parent: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      },
      reactions: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      }
    }
  });
}

async function deleteComment(id: string, context: ActionContext) {
  await prisma.comment.delete({
    where: { 
      id,
      issue: {
        workspaceId: context.workspace.id
      }
    }
  });
  return { success: true };
}

async function listComments(issueId: string, context: ActionContext) {
  // Verify the issue exists and belongs to the workspace
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, workspaceId: context.workspace.id }
  });
  
  if (!issue) {
    throw new Error('Issue not found');
  }

  return await prisma.comment.findMany({
    where: { issueId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      parent: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      },
      reactions: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });
}

// Reaction actions
async function createReaction(data: any, context: ActionContext) {
  // Verify the comment exists and belongs to a workspace issue
  const comment = await prisma.comment.findFirst({
    where: { 
      id: data.commentId,
      issue: {
        workspaceId: context.workspace.id
      }
    }
  });
  
  if (!comment) {
    throw new Error('Comment not found');
  }

  return await prisma.commentReaction.create({
    data: {
      ...data,
      userId: context.userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      comment: {
        select: {
          id: true,
          content: true,
        }
      }
    }
  });
}

async function deleteReaction(id: string, context: ActionContext) {
  await prisma.commentReaction.delete({
    where: { 
      id,
      comment: {
        issue: {
          workspaceId: context.workspace.id
        }
      }
    }
  });
  return { success: true };
}

async function listReactions(commentId: string, context: ActionContext) {
  // Verify the comment exists and belongs to a workspace issue
  const comment = await prisma.comment.findFirst({
    where: { 
      id: commentId,
      issue: {
        workspaceId: context.workspace.id
      }
    }
  });
  
  if (!comment) {
    throw new Error('Comment not found');
  }

  return await prisma.commentReaction.findMany({
    where: { commentId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// Bulk actions
async function bulkDelete(resourceType: string, ids: string[], context: ActionContext) {
  switch (resourceType) {
    case 'team':
      await prisma.team.deleteMany({
        where: { id: { in: ids }, workspaceId: context.workspace.id }
      });
      break;
    case 'project':
      await prisma.project.deleteMany({
        where: { id: { in: ids }, workspaceId: context.workspace.id }
      });
      break;
    case 'label':
      await prisma.label.deleteMany({
        where: { id: { in: ids }, workspaceId: context.workspace.id }
      });
      break;
    case 'issue':
      await prisma.issue.deleteMany({
        where: { id: { in: ids }, workspaceId: context.workspace.id }
      });
      break;
    case 'issueType':
      await prisma.issueType.deleteMany({
        where: { id: { in: ids }, workspaceId: context.workspace.id }
      });
      break;
    case 'member':
      await prisma.workspaceMember.deleteMany({
        where: { userId: { in: ids }, workspaceId: context.workspace.id }
      });
      break;
    default:
      throw new Error(`Bulk delete not supported for resource type: ${resourceType}`);
  }
  return { success: true, deletedCount: ids.length };
}

async function bulkUpdate(resourceType: string, ids: string[], updates: any, context: ActionContext) {
  switch (resourceType) {
    case 'team':
      await prisma.team.updateMany({
        where: { id: { in: ids }, workspaceId: context.workspace.id },
        data: updates
      });
      break;
    case 'project':
      await prisma.project.updateMany({
        where: { id: { in: ids }, workspaceId: context.workspace.id },
        data: updates
      });
      break;
    case 'label':
      await prisma.label.updateMany({
        where: { id: { in: ids }, workspaceId: context.workspace.id },
        data: updates
      });
      break;
    case 'issue':
      await prisma.issue.updateMany({
        where: { id: { in: ids }, workspaceId: context.workspace.id },
        data: updates
      });
      break;
    case 'issueType':
      await prisma.issueType.updateMany({
        where: { id: { in: ids }, workspaceId: context.workspace.id },
        data: updates
      });
      break;
    case 'member':
      await prisma.workspaceMember.updateMany({
        where: { userId: { in: ids }, workspaceId: context.workspace.id },
        data: updates
      });
      break;
    default:
      throw new Error(`Bulk update not supported for resource type: ${resourceType}`);
  }
  return { success: true, updatedCount: ids.length };
}

// Get states for a specific issue type
async function getStatesForIssueType(issueTypeId: string, context: ActionContext) {
  const issueType = await prisma.issueType.findFirst({
    where: { 
      id: issueTypeId, 
      workspaceId: context.workspace.id 
    },
    include: {
      statusFlow: {
        include: {
          states: {
            orderBy: { position: 'asc' }
          }
        }
      }
    }
  });

  if (!issueType) {
    throw new Error('Issue type not found');
  }

  // If no status flow is associated, return all states from the workspace
  if (!issueType.statusFlow) {
    return await prisma.state.findMany({
      where: { 
        statusFlow: {
          workspaceId: context.workspace.id
        }
      },
      orderBy: { position: 'asc' }
    });
  }

  return issueType.statusFlow.states;
}

// Get field set configurations for a specific field set
async function getFieldSetConfigurations(fieldSetId: string, context: ActionContext) {
  const fieldSet = await prisma.fieldSet.findFirst({
    where: { 
      id: fieldSetId, 
      workspaceId: context.workspace.id 
    },
    include: {
      configurations: {
        orderBy: { displayOrder: 'asc' }
      }
    }
  });

  if (!fieldSet) {
    throw new Error('Field set not found');
  }

  return fieldSet.configurations;
}

// Status Flow actions
async function createStatusFlow(data: any, context: ActionContext) {
  return await prisma.statusFlow.create({
    data: {
      ...data,
      workspaceId: context.workspace.id,
    },
    include: {
      states: {
        orderBy: { position: 'asc' }
      }
    }
  });
}

async function updateStatusFlow(id: string, data: any, context: ActionContext) {
  return await prisma.statusFlow.update({
    where: { id, workspaceId: context.workspace.id },
    data,
    include: {
      states: {
        orderBy: { position: 'asc' }
      }
    }
  });
}

async function deleteStatusFlow(id: string, context: ActionContext) {
  await prisma.statusFlow.delete({
    where: { id, workspaceId: context.workspace.id }
  });
  return { success: true };
}

async function listStatusFlows(context: ActionContext) {
  return await prisma.statusFlow.findMany({
    where: { workspaceId: context.workspace.id },
    include: {
      states: {
        orderBy: { position: 'asc' }
      },
      _count: {
        select: {
          issueTypes: true
        }
      }
    },
    orderBy: { position: 'asc' }
  });
}

async function getStatusFlow(id: string, context: ActionContext) {
  return await prisma.statusFlow.findFirst({
    where: { id, workspaceId: context.workspace.id },
    include: {
      states: {
        orderBy: { position: 'asc' }
      }
    }
  });
}

// Field Set actions
async function createFieldSet(data: any, context: ActionContext) {
  return await prisma.fieldSet.create({
    data: {
      ...data,
      workspaceId: context.workspace.id,
    },
    include: {
      configurations: {
        orderBy: { displayOrder: 'asc' }
      }
    }
  });
}

async function updateFieldSet(id: string, data: any, context: ActionContext) {
  return await prisma.fieldSet.update({
    where: { id, workspaceId: context.workspace.id },
    data,
    include: {
      configurations: {
        orderBy: { displayOrder: 'asc' }
      }
    }
  });
}

async function deleteFieldSet(id: string, context: ActionContext) {
  await prisma.fieldSet.delete({
    where: { id, workspaceId: context.workspace.id }
  });
  return { success: true };
}

async function listFieldSets(context: ActionContext) {
  return await prisma.fieldSet.findMany({
    where: { workspaceId: context.workspace.id },
    include: {
      configurations: {
        orderBy: { displayOrder: 'asc' }
      },
      _count: {
        select: {
          issueTypes: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}

async function getFieldSet(id: string, context: ActionContext) {
  return await prisma.fieldSet.findFirst({
    where: { id, workspaceId: context.workspace.id },
    include: {
      configurations: {
        orderBy: { displayOrder: 'asc' }
      }
    }
  });
} 