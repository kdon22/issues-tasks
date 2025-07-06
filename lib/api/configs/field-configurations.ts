// Field Configurations API Config - Linear Clone (Super DRY!)
import { prisma } from '@/lib/prisma';
import { fieldConfigurationSchema } from '@/lib/validations/custom-field';
import { CrudConfig } from '../types';

export const fieldConfigurationsConfig: CrudConfig<any> = {
  model: prisma.fieldConfiguration,
  schema: {
    create: fieldConfigurationSchema,
    update: fieldConfigurationSchema.partial(),
  },
  relations: ['team', 'workspace'],
  filters: {
    default: (ctx) => ({
      // Users can only see field configurations in their workspace
      workspace: {
        members: {
          some: { userId: ctx.userId }
        }
      }
    }),
  },
  permissions: {
    create: (ctx) => true, // All authenticated users can create field configurations
    update: (ctx, item) => true, // TODO: Check workspace/team role
    delete: (ctx, item) => true, // TODO: Check workspace/team role
  },
}; 