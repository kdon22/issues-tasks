// Issues API Config - Linear Clone (Super DRY!)
import { prisma } from '@/lib/prisma';
import { issueCreateSchema, issueUpdateSchema } from '@/lib/validations/issue';
import { CrudConfig } from '../types';

export const issuesConfig: CrudConfig<any> = {
  model: prisma.issue,
  schema: {
    create: issueCreateSchema,
    update: issueUpdateSchema,
  },
  relations: [
    'creator', 
    'assignee', 
    'team', 
    'project', 
    'state', 
    'labels',
    'comments',
    'attachments',
    '_count'
  ],
  filters: {
    default: (ctx) => ({
      // Users can only see issues in their teams
      team: {
        members: {
          some: { userId: ctx.userId }
        }
      }
    }),
  },
  permissions: {
    create: (ctx) => true, // All authenticated users can create issues
    update: (ctx, item) => item.creatorId === ctx.userId || item.assigneeId === ctx.userId,
    delete: (ctx, item) => item.creatorId === ctx.userId,
  },
}; 