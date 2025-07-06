// Custom Fields API Config - Linear Clone (Super DRY!)
import { prisma } from '@/lib/prisma';
import { customFieldSchema } from '@/lib/validations/custom-field';
import { CrudConfig } from '../types';

export const customFieldsConfig: CrudConfig<any> = {
  model: prisma.customField,
  schema: {
    create: customFieldSchema,
    update: customFieldSchema.partial(),
  },
  relations: ['team', 'workspace', 'createdBy'],
  filters: {
    default: (ctx) => ({
      // Users can only see custom fields in their workspace
      workspace: {
        members: {
          some: { userId: ctx.userId }
        }
      }
    }),
  },
  permissions: {
    create: (ctx) => true, // All authenticated users can create custom fields
    update: (ctx, item) => item.createdById === ctx.userId,
    delete: (ctx, item) => item.createdById === ctx.userId,
  },
}; 