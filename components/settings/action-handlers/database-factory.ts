import { prisma } from '@/lib/prisma';
import * as resourceConfigs from '../../../features';

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
          name: config.name?.singular || config.name || 'Resource',
          actionPrefix: config.actionPrefix,
          prismaModel: this.derivePrismaModelName(config.actionPrefix),
          workspaceIdField: 'workspaceId'
        };
        
        this.registerResource(resourceConfig);
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
      'reaction': 'commentReaction',
      'labelGroup': 'labelGroup'
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
      console.error(`❌ Prisma model not found: ${config.prismaModel}`);
      console.error('❌ Available models:', Object.keys(prisma));
      throw new Error(`Prisma model not found: ${config.prismaModel}`);
    }

    return {
      create: async (data: any, context: ActionContext) => {
        // Validate context
        if (!context?.workspace?.id) {
          throw new Error('Invalid workspace context');
        }

        // Handle special cases first
        if (config.actionPrefix === 'member') {
          return this.createMemberWithUserHandling(data, context);
        }

        if (config.actionPrefix === 'issue') {
          return this.createIssueWithIdentifier(data, context);
        }

        if (config.actionPrefix === 'project') {
          return this.createProjectWithIdentifier(data, context);
        }

        if (config.actionPrefix === 'fieldSet') {
          return this.createFieldSetWithConfigurations(data, context);
        }

        // Process create data generically
        const createData = this.processCreateData(data, context);

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
        
        // Handle special cases first
        if (config.actionPrefix === 'fieldSet') {
          return this.updateFieldSetWithConfigurations(id, data, context);
        }
        
        // Process update data to handle relations properly
        const updateData = this.processUpdateData(data, config.actionPrefix);
        
        return await model.update({
          where,
          data: updateData,
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
    if (config.actionPrefix === 'member') {
      return {
        workspaceId: context.workspace.id
      };
    }

    if (config.actionPrefix === 'state') {
      return {
        workspaceId: context.workspace.id
      };
    }

    if (config.actionPrefix === 'comment') {
      return {
        issue: {
          workspaceId: context.workspace.id
        }
      };
    }

    if (config.actionPrefix === 'reaction') {
      return {
        comment: {
          issue: {
            workspaceId: context.workspace.id
          }
        }
      };
    }

    return {
      workspaceId: context.workspace.id
    };
  }

  // Process create data generically
  private static processCreateData(data: any, context: ActionContext): any {
    // Create a copy of the data to avoid mutations
    const processedData = { ...data };
    
    // Add workspace context
    processedData.workspaceId = context.workspace.id;
    
    // Remove system fields that shouldn't be set on create
    delete processedData.id;
    delete processedData.createdAt;
    delete processedData.updatedAt;
    
    // Remove undefined and null values to avoid Prisma errors
    Object.keys(processedData).forEach(key => {
      if (processedData[key] === undefined || processedData[key] === null || processedData[key] === '') {
        delete processedData[key];
      }
    });
    
    return processedData;
  }

  // Process update data to handle relations and special fields generically
  private static processUpdateData(data: any, actionPrefix: string): any {
    // Create a copy of the data to avoid mutations
    const processedData = { ...data };
    
    // Remove fields that shouldn't be updated directly
    delete processedData.id;
    delete processedData.createdAt;
    delete processedData.updatedAt;
    delete processedData.workspaceId; // This is set by context, not by user input
    
    // Remove undefined and null values to avoid Prisma errors
    Object.keys(processedData).forEach(key => {
      if (processedData[key] === undefined || processedData[key] === null || processedData[key] === '') {
        delete processedData[key];
      }
    });
    
    return processedData;
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
      },
      labelGroup: {
        include: {
          labels: {
            orderBy: { position: 'asc' }
          },
          _count: {
            select: {
              labels: true
            }
          }
        }
      },
      label: {
        include: {
          group: {
            select: { id: true, name: true, color: true }
          }
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

  // Special handling for field set creation with configurations
  private static async createFieldSetWithConfigurations(data: any, context: ActionContext) {
    // Process the basic field set data (excluding configurations)
    const { configurations, ...fieldSetData } = data;
    
    // Process create data generically
    const createData = this.processCreateData(fieldSetData, context);
    
    // Handle configurations separately if provided
    let finalCreateData: any = createData;
    
    if (configurations && Array.isArray(configurations)) {
      // Transform configurations for Prisma nested create
      const configurationsData = configurations.map(config => ({
        fieldKey: config.fieldKey,
        isRequired: config.isRequired,
        isVisible: config.isVisible || true,
        displayOrder: config.displayOrder,
        context: config.context || 'create',
        showOnSubtask: config.showOnSubtask,
        showOnNewIssue: config.showOnNewIssue,
      }));

      finalCreateData.configurations = {
        create: configurationsData
      };
    }

    try {
      const result = await prisma.fieldSet.create({
        data: finalCreateData,
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
      });

      return result;
    } catch (error) {
      console.error('❌ DatabaseFactory - Create failed:', error);
      throw error;
    }
  }

  // Special handling for field set updates with configurations
  private static async updateFieldSetWithConfigurations(id: string, data: any, context: ActionContext) {
    // Process the basic field set data (excluding configurations)
    const { configurations, ...fieldSetData } = data;
    
    // Remove fields that shouldn't be updated directly
    delete fieldSetData.id;
    delete fieldSetData.createdAt;
    delete fieldSetData.updatedAt;
    delete fieldSetData.workspaceId;
    delete fieldSetData._count;
    
    // Remove undefined and null values
    Object.keys(fieldSetData).forEach(key => {
      if (fieldSetData[key] === undefined || fieldSetData[key] === null || fieldSetData[key] === '') {
        delete fieldSetData[key];
      }
    });

    // Handle configurations separately if provided
    let updateData: any = fieldSetData;
    
    if (configurations && Array.isArray(configurations)) {
      // Transform configurations for Prisma nested update
      const configurationsData = configurations.map(config => ({
        fieldKey: config.fieldKey,
        isRequired: config.isRequired,
        isVisible: config.isVisible || true,
        displayOrder: config.displayOrder,
        context: config.context || 'create',
        showOnSubtask: config.showOnSubtask,
        showOnNewIssue: config.showOnNewIssue,
      }));

      updateData.configurations = {
        deleteMany: {}, // Delete all existing configurations
        create: configurationsData // Create new configurations
      };
    }

    try {
      const result = await prisma.fieldSet.update({
        where: {
          id,
          workspaceId: context.workspace.id
        },
        data: updateData,
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
      });

      return result;
    } catch (error) {
      console.error('❌ DatabaseFactory - Update failed:', error);
      throw error;
    }
  }

  // Generate all action handlers for all auto-discovered resources
  static generateAllHandlers(): Record<string, Function> {
    const handlers: Record<string, Function> = {};

    this.resourceConfigs.forEach((config, actionPrefix) => {
      try {
        const operations = this.createResourceOperations(actionPrefix);
        
        handlers[`${actionPrefix}.create`] = operations.create;
        handlers[`${actionPrefix}.update`] = operations.update;
        handlers[`${actionPrefix}.delete`] = operations.delete;
        handlers[`${actionPrefix}.list`] = operations.list;
        handlers[`${actionPrefix}.get`] = operations.get;
      } catch (error) {
        console.error(`❌ Failed to generate handlers for ${actionPrefix}:`, error);
      }
    });

    return handlers;
  }
}

// Initialize the factory by auto-discovering resources
DatabaseFactory.initializeResourcesFromConfigs();

// Export the generated handlers
export const generatedHandlers = DatabaseFactory.generateAllHandlers();