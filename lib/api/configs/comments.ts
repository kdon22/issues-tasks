import { prisma } from '@/lib/prisma';
import { commentCreateSchema, commentUpdateSchema } from '@/lib/validations/comment';
import { CrudConfig } from '../types';

export const commentsConfig: CrudConfig<any> = {
  model: prisma.comment,
  schema: {
    create: commentCreateSchema,
    update: commentUpdateSchema,
  },
  relations: ['user'],
  filters: {
    default: (ctx) => ({}), // Issue filtering is handled by the route
  },
  permissions: {
    create: (ctx) => true,
    update: (ctx, item) => item.userId === ctx.userId, // Only allow editing own comments
    delete: (ctx, item) => item.userId === ctx.userId, // Only allow deleting own comments
  },
}; 