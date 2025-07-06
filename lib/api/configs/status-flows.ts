// Status Flows API Config - Linear Clone
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { CrudConfig } from '../types';

// Schema for creating a new status flow
const statusFlowCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#6B7280'),
  isDefault: z.boolean().default(false),
});

// Schema for updating a status flow
const statusFlowUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  isDefault: z.boolean().optional(),
});

export const statusFlowsConfig: CrudConfig<any> = {
  model: prisma.statusFlow, // Use the actual StatusFlow model
  schema: {
    create: statusFlowCreateSchema,
    update: statusFlowUpdateSchema,
  },
  relations: ['workspace', 'states', 'issueTypes'],
  filters: {
    default: (ctx) => ({}), // Workspace filtering is handled by workspace-crud-factory
  },
  permissions: {
    create: (ctx) => true,
    update: (ctx, item) => true,
    delete: (ctx, item) => true,
  },
}; 