import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { actionHandlers } from '@/components/settings/action-handlers';
import { generatedHandlers } from '@/components/settings/action-handlers/database-factory';

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

    // Route to specific action handlers (now factory-generated!)
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

// Main action dispatcher - uses factory-generated handlers!
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
  // Handle bulk operations
  if (action === 'bulkDelete') {
    return bulkDelete(resourceType!, data.ids, context);
  }
  if (action === 'bulkUpdate') {
    return bulkUpdate(resourceType!, data.ids, data.updates, context);
  }
  if (action === 'bootstrap') {
    return bootstrapWorkspace(context);
  }
  
  const handler = (actionHandlers as Record<string, any>)[action];
  if (!handler) throw new Error(`Unknown action: ${action}`);
  
  // All CRUD operations are now handled by the factory!
  // Pass the correct arguments based on the operation type
  const operation = action.split('.')[1];
  
  if (operation === 'list') {
    return handler(context);
  } else if (operation === 'create') {
    return handler(data, context);
  } else if (operation === 'get') {
    return handler(resourceId, context);
  } else if (['update', 'delete'].includes(operation)) {
    return handler(resourceId, data, context);
  }
  
  // For custom actions, pass all arguments
  return handler(resourceId, data, context);
}

// Bootstrap entire workspace data (Linear-style full download)
// This is one of the few remaining custom functions
async function bootstrapWorkspace(context: ActionContext) {
  const startTime = Date.now();
  
  // Use the factory-generated list operations!
  const [teams, projects, labels, members, issueTypes, statusFlows, fieldSets, issues] = await Promise.all([
    (generatedHandlers as any)['team.list'](context),
    (generatedHandlers as any)['project.list'](context),
    (generatedHandlers as any)['label.list'](context),
    (generatedHandlers as any)['member.list'](context),
    (generatedHandlers as any)['issueType.list'](context),
    (generatedHandlers as any)['statusFlow.list'](context),
    (generatedHandlers as any)['fieldSet.list'](context),
    (generatedHandlers as any)['issue.list'](context),
  ]);

  // Get all states from status flows
  const states = statusFlows.flatMap((flow: any) => flow.states || []);

  // Get all comments for all issues
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
    statusFlows,
    fieldSets,
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
        statusFlows: statusFlows.length,
        fieldSets: fieldSets.length,
        issues: issues.length,
        comments: allComments.length
      }
    }
  };
}

// Bulk operations (using factory-generated handlers where possible)
async function bulkDelete(resourceType: string, ids: string[], context: ActionContext) {
  const deleteHandler = (generatedHandlers as any)[`${resourceType}.delete`];
  
  if (deleteHandler) {
    // Use factory-generated delete operations
    const results = await Promise.all(
      ids.map(id => deleteHandler(id, context))
    );
    return { success: true, deletedCount: results.length };
  }
  
  // Fallback for resources not in factory
  switch (resourceType) {
    case 'issue':
      await prisma.issue.deleteMany({
        where: { id: { in: ids }, workspaceId: context.workspace.id }
      });
      break;
    case 'comment':
      await prisma.comment.deleteMany({
        where: { 
          id: { in: ids },
          issue: { workspaceId: context.workspace.id }
        }
      });
      break;
    default:
      throw new Error(`Bulk delete not supported for resource type: ${resourceType}`);
  }
  return { success: true, deletedCount: ids.length };
}

async function bulkUpdate(resourceType: string, ids: string[], updates: any, context: ActionContext) {
  const updateHandler = (generatedHandlers as any)[`${resourceType}.update`];
  
  if (updateHandler) {
    // Use factory-generated update operations
    const results = await Promise.all(
      ids.map(id => updateHandler(id, updates, context))
    );
    return { success: true, updatedCount: results.length };
  }
  
  // Fallback for resources not in factory
  switch (resourceType) {
    case 'issue':
      await prisma.issue.updateMany({
        where: { id: { in: ids }, workspaceId: context.workspace.id },
        data: updates
      });
      break;
    case 'comment':
      await prisma.comment.updateMany({
        where: { 
          id: { in: ids },
          issue: { workspaceId: context.workspace.id }
        },
        data: updates
      });
      break;
    default:
      throw new Error(`Bulk update not supported for resource type: ${resourceType}`);
  }
  return { success: true, updatedCount: ids.length };
}

// 🎉 That's it! From 1420 lines to ~300 lines!
// All CRUD operations are now auto-generated by DatabaseFactory
// No more duplicate code for every resource! 