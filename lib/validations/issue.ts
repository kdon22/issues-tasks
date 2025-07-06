// Issue Validation Schemas - Linear Clone
import { z } from 'zod';
import { id, priority } from './shared';

// Issue Schema
export const issueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  priority: priority.default('MEDIUM'),
  estimate: z.number().min(0).optional(),
  dueDate: z.date().optional(),
  assigneeId: id.optional(),
  teamId: id,
  projectId: id.optional(),
  stateId: id,
  parentId: id.optional(),
  workspaceId: id,
});

// Issue Create Schema (for API creation - workspaceId added by workspace-crud-factory)
export const issueCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  priority: priority.default('MEDIUM'),
  estimate: z.number().min(0).optional(),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  assigneeId: z.union([id, z.literal(''), z.null()]).optional().transform((val) => val && val !== '' ? val : undefined),
  teamId: id,
  projectId: z.union([id, z.literal(''), z.null()]).optional().transform((val) => val && val !== '' ? val : undefined),
  stateId: id,
  parentId: z.union([id, z.literal(''), z.null()]).optional().transform((val) => val && val !== '' ? val : undefined),
  issueTypeId: id, // Add missing issueTypeId field
});

// Issue Update Schema
export const issueUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: priority.optional(),
  estimate: z.number().min(0).optional(),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  assigneeId: id.optional(),
  teamId: id.optional(),
  projectId: id.optional(),
  stateId: id.optional(),
  parentId: id.optional(),
});

// Type exports
export type IssueInput = z.infer<typeof issueSchema>;
export type IssueCreateInput = z.infer<typeof issueCreateSchema>;
export type IssueUpdateInput = z.infer<typeof issueUpdateSchema>; 