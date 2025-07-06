// Projects API Config - Linear Clone (Super DRY!)
import { prisma } from '@/lib/prisma';
import { projectCreateSchema, projectUpdateSchema } from '@/lib/validations/project';
import { CrudConfig } from '../types';

export const projectsConfig: CrudConfig<any> = {
  model: prisma.project,
  schema: {
    create: projectCreateSchema,
    update: projectUpdateSchema,
  },
  relations: ['lead', 'team', 'workspace', 'issues'],
  filters: {
    default: (ctx) => ({
      // Users can only see projects in their teams
      team: {
        members: {
          some: { userId: ctx.userId }
        }
      }
    }),
  },
  permissions: {
    create: (ctx) => true,
    update: (ctx, item) => item.leadUserId === ctx.userId,
    delete: (ctx, item) => item.leadUserId === ctx.userId,
  },
}; 