// API Types - Linear Clone
import { z } from 'zod';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiContext {
  userId: string;
  workspaceId?: string;
  teamId?: string;
}

export interface CrudConfig<T> {
  model: any; // Prisma model
  schema: {
    create: z.ZodSchema;
    update: z.ZodSchema;
    query?: z.ZodSchema;
  };
  relations?: string[];
  permissions?: {
    create?: (ctx: ApiContext) => boolean;
    read?: (ctx: ApiContext) => boolean;
    update?: (ctx: ApiContext, item: T) => boolean;
    delete?: (ctx: ApiContext, item: T) => boolean;
  };
  filters?: {
    default?: (ctx: ApiContext) => any | Promise<any>;
    user?: (ctx: ApiContext) => any | Promise<any>;
  };
}

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}); 