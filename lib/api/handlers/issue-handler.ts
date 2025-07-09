import { NextRequest, NextResponse } from 'next/server';
import { BaseWorkspaceHandler } from './base-handler';
import { WorkspaceContext } from '../middleware/workspace-middleware';
import { prisma } from '@/lib/prisma';
// Legacy issue validation - using simple schema validation
import { z } from 'zod';

const subtaskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  parentId: z.string().min(1, 'Parent ID is required'),
  teamId: z.string().optional(),
  stateId: z.string().optional(),
  issueTypeId: z.string().optional(),
  priority: z.string().optional().default('MEDIUM')
});

export class IssueHandler extends BaseWorkspaceHandler<any> {
  protected async beforeCreate(data: any, context: WorkspaceContext): Promise<any> {
    // Check if this is subtask creation
    const isSubtask = 'parentId' in data && data.parentId;
    
    if (isSubtask) {
      console.log('🔍 Detected subtask creation');
      return await this.handleSubtaskCreation(data, context);
    }
    
    return await this.handleRegularIssueCreation(data, context);
  }

  private async handleSubtaskCreation(data: any, context: WorkspaceContext): Promise<any> {
    console.log('🔧 Setting subtask defaults');
    
    // Get parent issue to inherit defaults from
    const parentIssue = await prisma.issue.findUnique({
      where: { id: data.parentId },
      include: { state: true, issueType: true }
    });

    if (!parentIssue) {
      throw new Error('Parent issue not found');
    }

    // Inherit team from parent if not provided
    if (!data.teamId) {
      data.teamId = parentIssue.teamId;
    }

    // Set default state if not provided
    if (!data.stateId) {
      const defaultState = await prisma.state.findFirst({
        where: { 
          type: 'UNSTARTED',
          statusFlow: {
            issueTypes: {
              some: {
                workspaceId: context.workspace.id
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });
      data.stateId = defaultState?.id || parentIssue.stateId;
    }

    // Set default issue type if not provided
    if (!data.issueTypeId) {
      const subtaskType = await prisma.issueType.findFirst({
        where: { 
          workspaceId: context.workspace.id,
          name: { contains: 'Subtask', mode: 'insensitive' }
        }
      });
      data.issueTypeId = subtaskType?.id || parentIssue.issueTypeId;
    }

    return await this.generateIssueIdentifier(data, context);
  }

  private async handleRegularIssueCreation(data: any, context: WorkspaceContext): Promise<any> {
    return await this.generateIssueIdentifier(data, context);
  }

  private async generateIssueIdentifier(data: any, context: WorkspaceContext): Promise<any> {
    // Add creator ID
    data.creatorId = context.userId;
    
    // Get team for identifier generation
    const team = await prisma.team.findUnique({
      where: { id: data.teamId }
    });
    
    if (!team) {
      throw new Error('Team not found');
    }

    // Get the next number for this team
    const lastIssue = await prisma.issue.findFirst({
      where: { teamId: data.teamId },
      orderBy: { number: 'desc' },
      select: { number: true }
    });

    const nextNumber = (lastIssue?.number || 0) + 1;
    data.identifier = `${team.identifier}-${nextNumber}`;
    data.number = nextNumber;

    return data;
  }

  // Override validation for subtasks
  async handlePost(context: WorkspaceContext, request: NextRequest) {
    const body = await request.json();
    
    // Use appropriate schema based on whether it's a subtask
    const schema = body.parentId ? subtaskCreateSchema : this.config.schema.create;
    const validatedData = schema.parse(body);
    
    const createData = await this.beforeCreate(
      this.buildCreateData(validatedData, context),
      context
    );

    const data = await this.config.model.create({
      data: createData,
      include: this.buildInclude(),
    });

    const finalData = await this.afterCreate(data, context);
    const response = this.buildApiResponse(finalData);

    return NextResponse.json(response, { status: 201 });
  }
} 