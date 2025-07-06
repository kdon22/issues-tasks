// States API Config - Linear Clone
import { prisma } from '@/lib/prisma';
import { stateCreateSchema, stateUpdateSchema } from '@/lib/validations/state';
import { CrudConfig } from '../types';

export const statesConfig: CrudConfig<any> = {
  model: prisma.state,
  schema: {
    create: stateCreateSchema,
    update: stateUpdateSchema,
  },
  relations: ['statusFlow', 'issues', '_count'],
  filters: {
    default: (ctx) => ({}), // Filtering is handled by parent status flow
  },
  permissions: {
    create: (ctx) => true,
    update: (ctx, item) => true,
    delete: (ctx, item) => true,
  },
}; 