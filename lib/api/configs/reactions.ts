import { prisma } from '@/lib/prisma';
import { reactionCreateSchema, reactionUpdateSchema } from '@/lib/validations/reaction';
import { CrudConfig } from '../types';

export const reactionsConfig: CrudConfig<any> = {
  model: (prisma as any).commentReaction,
  schema: {
    create: reactionCreateSchema,
    update: reactionUpdateSchema,
  },
  relations: ['user', 'comment'],
  filters: {
    default: (ctx) => ({
      commentId: ctx.query?.commentId || ctx.request?.url?.split('/').slice(-2, -1)[0],
    }),
  },
  permissions: {
    create: (ctx) => true, // Anyone can add reactions
    update: (ctx, item) => false, // Reactions can't be updated, only toggled
    delete: (ctx, item) => item.userId === ctx.userId, // Only delete own reactions
  },
}; 