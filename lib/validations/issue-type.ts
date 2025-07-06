// Issue Type Validation Schemas - Linear Clone
import { z } from 'zod';
import { id, color } from './shared';

// Issue Type Schema
export const issueTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  color,
  workspaceId: id,
  isDefault: z.boolean().default(false),
});

// Issue Type Create Schema (for API creation - workspaceId added by workspace-crud-factory)
export const issueTypeCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  color,
  isDefault: z.boolean().default(false),
});

// Issue Type Update Schema
export const issueTypeUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long').optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  color: color.optional(),
  isDefault: z.boolean().optional(),
});

// Type exports
export type IssueTypeInput = z.infer<typeof issueTypeSchema>;
export type IssueTypeCreateInput = z.infer<typeof issueTypeCreateSchema>;
export type IssueTypeUpdateInput = z.infer<typeof issueTypeUpdateSchema>; 