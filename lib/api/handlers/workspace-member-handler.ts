import { NextRequest, NextResponse } from 'next/server';
import { BaseWorkspaceHandler } from './base-handler';
import { WorkspaceContext } from '../middleware/workspace-middleware';
import { prisma } from '@/lib/prisma';

export class WorkspaceMemberHandler extends BaseWorkspaceHandler<any> {
  protected async beforeCreate(data: any, context: WorkspaceContext): Promise<any> {
    // Find or create user by email
    let user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name || data.email,
          password: 'temp-password-' + Date.now(), // Temporary password
          status: 'PENDING',
        },
      });
    }

    // Check if user is already a member of this workspace
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: context.workspace.id,
        },
      },
    });

    if (existingMember) {
      throw new Error('User is already a member of this workspace');
    }

    // Return the data for WorkspaceMember creation
    return {
      userId: user.id,
      workspaceId: context.workspace.id,
      role: data.role || 'MEMBER',
    };
  }

  protected async beforeUpdate(data: any, context: WorkspaceContext & { itemId: string }): Promise<any> {
    // Get existing member to access user ID
    const existingMember = await prisma.workspaceMember.findUnique({
      where: { id: context.itemId },
    });

    if (!existingMember) {
      throw new Error('Member not found');
    }

    // Separate user fields from member fields
    const userFields = ['status', 'name'];
    const userUpdates: any = {};
    const memberUpdates: any = {};

    Object.keys(data).forEach(key => {
      if (userFields.includes(key)) {
        userUpdates[key] = data[key];
      } else {
        memberUpdates[key] = data[key];
      }
    });

    // Update user fields if any
    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: existingMember.userId },
        data: userUpdates,
      });
    }

    // Return only member fields for the main update
    return memberUpdates;
  }

  async handlePut(context: WorkspaceContext & { itemId: string }, request: NextRequest): Promise<NextResponse> {
    const existingItem = await this.config.model.findUnique({
      where: { 
        id: context.itemId,
        workspaceId: context.workspace.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = this.config.schema.update.parse(body);
    
    const memberUpdates = await this.beforeUpdate(validatedData, context);

    let data = existingItem;
    if (Object.keys(memberUpdates).length > 0) {
      data = await this.config.model.update({
        where: { id: context.itemId },
        data: memberUpdates,
        include: this.buildInclude(),
      });
    } else {
      // Refetch with includes to get updated user data
      data = await this.config.model.findUnique({
        where: { id: context.itemId },
        include: this.buildInclude(),
      });
    }

    const finalData = await this.afterUpdate(data, context);
    const response = this.buildApiResponse(finalData);

    return NextResponse.json(response);
  }
} 