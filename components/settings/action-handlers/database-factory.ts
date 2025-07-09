import { prisma } from '@/lib/prisma';
import * as resourceConfigs from '../resource-configs';

// Action context interface
interface ActionContext {
  userId: string;
  workspace: { id: string; name: string };
  request: Request;
}

// Resource configuration interface
interface ResourceConfig {
  name: string;
  actionPrefix: string;
  prismaModel: string;
  workspaceIdField?: string;
  customOperations?: Record<string, Function>;
}

// Factory class for auto-generating database operations
export class DatabaseFactory {
  private static resourceConfigs: Map<string, ResourceConfig> = new Map();

  // Auto-discover and register all resources from config files
  static initializeResourcesFromConfigs() {
    // Auto-discover all resource configs that have an actionPrefix
    Object.values(resourceConfigs).forEach((config: any) => {
      if (config?.actionPrefix) {
        const resourceConfig: ResourceConfig = {
          name: config.name,
          actionPrefix: config.actionPrefix,
          prismaModel: this.derivePrismaModelName(config.actionPrefix),
          workspaceIdField: 'workspaceId'
        };
        
        this.registerResource(resourceConfig);
        console.log(`🏭 Auto-registered resource: ${config.actionPrefix} -> ${resourceConfig.prismaModel}`);
      }
    });
  }

  // Automatically derive Prisma model name from actionPrefix
  private static derivePrismaModelName(actionPrefix: string): string {
    const modelMap: Record<string, string> = {
      'member': 'workspaceMember',
      'issueType': 'issueType',
      'statusFlow': 'statusFlow',
      'fieldSet': 'fieldSet',
      'state': 'state',
      'reaction': 'commentReaction'
    };

    // Return mapped name or default to actionPrefix
    return modelMap[actionPrefix] || actionPrefix;
  }

  // Register a resource configuration
  static registerResource(config: ResourceConfig) {
    this.resourceConfigs.set(config.actionPrefix, config);
  }

  // Generate all CRUD operations for a resource
  static createResourceOperations(actionPrefix: string) {
    const config = this.resourceConfigs.get(actionPrefix);
    if (!config) {
      throw new Error(`Resource config not found for: ${actionPrefix}`);
    }

    const model = (prisma as any)[config.prismaModel];
    if (!model) {
      throw new Error(`Prisma model not found: ${config.prismaModel}`);
    }

    return {
      create: async (data: any, context: ActionContext) => {
        // Validate context
        if (!context?.workspace?.id) {
          throw new Error('Invalid workspace context');
        }

        // Handle special cases that don't have direct workspaceId
        if (config.actionPrefix === 'state') {
          // State doesn't have workspaceId, it's related through statusFlow
          const createData = {
            name: data.name,
            description: data.description,
            color: data.color,
            type: data.type,
            position: data.position || 0,
            statusFlowId: data.statusFlowId
          };

          return await model.create({
            data: createData,
            ...this.getIncludeOptions(config.actionPrefix)
          });
        }

        const createData = {
          ...data,
          workspaceId: context.workspace.id,
        };

        // Handle special cases
        if (config.actionPrefix === 'member') {
          return this.createMemberWithUserHandling(data, context);
        }

        if (config.actionPrefix === 'issue') {
          return this.createIssueWithIdentifier(data, context);
        }

        if (config.actionPrefix === 'project') {
          return this.createProjectWithIdentifier(data, context);
        }

        return await model.create({
          data: createData,
          ...this.getIncludeOptions(config.actionPrefix)
        });
      },

      update: async (id: string, data: any, context: ActionContext) => {
        // Validate context
        if (!context?.workspace?.id) {
          throw new Error('Invalid workspace context');
        }

        const where = this.buildWhereClause(id, context, config);
        
        // Handle special cases that don't have direct workspaceId
        if (config.actionPrefix === 'state') {
          // For state updates, we only update the direct fields
          const updateData = {
            name: data.name,
            description: data.description,
            color: data.color,
            type: data.type,
            position: data.position
          };

          return await model.update({
            where,
            data: updateData,
            ...this.getIncludeOptions(config.actionPrefix)
          });
        }
        
        return await model.update({
          where,
          data,
          ...this.getIncludeOptions(config.actionPrefix)
        });
      },

      delete: async (id: string, context: ActionContext) => {
        // Validate context
        if (!context?.workspace?.id) {
          throw new Error('Invalid workspace context');
        }

        const where = this.buildWhereClause(id, context, config);
        
        await model.delete({ where });
        return { success: true };
      },

      list: async (context: ActionContext) => {
        // Validate context
        if (!context?.workspace?.id) {
          throw new Error('Invalid workspace context');
        }

        const where = this.buildListWhereClause(context, config);
        
        return await model.findMany({
          where,
          ...this.getIncludeOptions(config.actionPrefix),
          orderBy: { createdAt: 'desc' }
        });
      },

      get: async (id: string, context: ActionContext) => {
        // Validate context
        if (!context?.workspace?.id) {
          throw new Error('Invalid workspace context');
        }

        const where = this.buildWhereClause(id, context, config);
        
        return await model.findFirst({
          where,
          ...this.getIncludeOptions(config.actionPrefix)
        });
      }
    };
  }

  // Build where clause for single resource operations
  private static buildWhereClause(id: string, context: ActionContext, config: ResourceConfig) {
    if (config.actionPrefix === 'member') {
      return {
        userId_workspaceId: {
          userId: id,
          workspaceId: context.workspace.id
        }
      };
    }

    if (config.actionPrefix === 'state') {
      return {
        id,
        statusFlow: {
          workspaceId: context.workspace.id
        }
      };
    }

    if (config.actionPrefix === 'comment') {
      return {
        id,
        issue: {
          workspaceId: context.workspace.id
        }
      };
    }

    if (config.actionPrefix === 'reaction') {
      return {
        id,
        comment: {
          issue: {
            workspaceId: context.workspace.id
          }
        }
      };
    }

    return {
      id,
      workspaceId: context.workspace.id
    };
  }

  // Build where clause for list operations
  private static buildListWhereClause(context: ActionContext, config: ResourceConfig) {
    if (config.actionPrefix === 'state') {
      return {
        statusFlow: {
          workspaceId: context.workspace.id
        }
      };
    }

    return {
      workspaceId: context.workspace.id
    };
  }

  // Get include options for complex relations
  private static getIncludeOptions(actionPrefix: string) {
    const includeMap: Record<string, any> = {
      member: {
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
      },
      statusFlow: {
        include: {
          states: {
            orderBy: { position: 'asc' }
          },
          _count: {
            select: {
              issueTypes: true
            }
          }
        }
      },
      fieldSet: {
        include: {
          configurations: {
            orderBy: { displayOrder: 'asc' }
          },
          _count: {
            select: {
              issueTypes: true
            }
          }
        }
      },
      issue: {
        include: {
          creator: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
          team: { select: { id: true, name: true, identifier: true } },
          project: { select: { id: true, name: true, identifier: true, color: true } },
          state: { select: { id: true, name: true, color: true, type: true } },
          issueType: { select: { id: true, name: true, icon: true } },
          labels: {
            include: {
              label: {
                select: { id: true, name: true, color: true, description: true }
              }
            }
          },
          _count: {
            select: { comments: true, attachments: true }
          }
        }
      },
      comment: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          parent: {
            select: {
              id: true,
              content: true,
              user: { select: { id: true, name: true, email: true } }
            }
          },
          replies: {
            include: {
              user: { select: { id: true, name: true, email: true } }
            }
          },
          reactions: {
            include: {
              user: { select: { id: true, name: true, email: true } }
            }
          }
        }
      },
      state: {
        include: {
          statusFlow: true
        }
      }
    };

    return includeMap[actionPrefix] || {};
  }

  // Special handling for member creation (user lookup/creation)
  private static async createMemberWithUserHandling(data: any, context: ActionContext) {
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

  // Special handling for issue creation (identifier generation)
  private static async createIssueWithIdentifier(data: any, context: ActionContext) {
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
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true, identifier: true } },
        project: { select: { id: true, name: true, identifier: true, color: true } },
        state: { select: { id: true, name: true, color: true, type: true } },
        issueType: { select: { id: true, name: true, icon: true } },
        labels: {
          include: {
            label: {
              select: { id: true, name: true, color: true, description: true }
            }
          }
        },
        _count: {
          select: { comments: true, attachments: true }
        }
      }
    });
  }

  // Special handling for project creation (identifier generation)
  private static async createProjectWithIdentifier(data: any, context: ActionContext) {
    // Get the last project identifier for this workspace to generate a unique one
    const lastProject = await prisma.project.findFirst({
      where: { workspaceId: context.workspace.id },
      orderBy: { createdAt: 'desc' }
    });

    // Extract number from existing identifiers like "PROJ-1", "PROJ-2", etc.
    let nextNumber = 1;
    if (lastProject?.identifier) {
      const match = lastProject.identifier.match(/PROJ-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const identifier = `PROJ-${nextNumber}`;

    return await prisma.project.create({
      data: {
        ...data,
        identifier,
        workspaceId: context.workspace.id,
      },
      include: {
        team: { select: { id: true, name: true, identifier: true } },
        _count: {
          select: { issues: true }
        }
      }
    });
  }

  // Generate all action handlers for all auto-discovered resources
  static generateAllHandlers(): Record<string, Function> {
    const handlers: Record<string, Function> = {};

    this.resourceConfigs.forEach((config, actionPrefix) => {
      const operations = this.createResourceOperations(actionPrefix);
      
      handlers[`${actionPrefix}.create`] = operations.create;
      handlers[`${actionPrefix}.update`] = operations.update;
      handlers[`${actionPrefix}.delete`] = operations.delete;
      handlers[`${actionPrefix}.list`] = operations.list;
      handlers[`${actionPrefix}.get`] = operations.get;
    });

    console.log(`🚀 Generated ${Object.keys(handlers).length} handlers for ${this.resourceConfigs.size} resources`);
    return handlers;
  }
}

// Initialize the factory by auto-discovering resources
DatabaseFactory.initializeResourcesFromConfigs();

// Export the generated handlers
export const generatedHandlers = DatabaseFactory.generateAllHandlers();