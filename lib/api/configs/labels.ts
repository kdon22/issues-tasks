// Labels API Config - Linear Clone
import { prisma } from '@/lib/prisma';
import { labelCreateSchema, labelUpdateSchema } from '@/lib/validations/label';
import { CrudConfig } from '../types';

export const labelsConfig: CrudConfig<any> = {
  model: prisma.label,
  schema: {
    create: labelCreateSchema,
    update: labelUpdateSchema,
  },
  relations: ['workspace', '_count'],
  filters: {
    default: (ctx) => ({}), // Workspace filtering is handled by workspace-crud-factory
  },
  permissions: {
    create: (ctx) => true,
    update: (ctx, item) => true,
    delete: (ctx, item) => true,
  },
}; 