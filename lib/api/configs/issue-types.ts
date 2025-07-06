// Issue Types API Config - Linear Clone
import { prisma } from '@/lib/prisma';
import { issueTypeCreateSchema, issueTypeUpdateSchema } from '@/lib/validations/issue-type';
import { CrudConfig } from '../types';

export const issueTypesConfig: CrudConfig<any> = {
  model: prisma.issueType,
  schema: {
    create: issueTypeCreateSchema,
    update: issueTypeUpdateSchema,
  },
  relations: ['workspace', 'statusFlow', '_count'],
  filters: {
    default: (ctx) => ({}), // Workspace filtering is handled by workspace-crud-factory
  },
  permissions: {
    create: (ctx) => true,
    update: (ctx, item) => true,
    delete: (ctx, item) => true,
  },
}; 