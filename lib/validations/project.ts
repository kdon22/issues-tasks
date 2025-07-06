// Project Validation Schemas - Linear Clone
import { z } from 'zod';
import { id, name, description, color, identifier, dateTransform, projectStatus } from './shared';

// Project Schema
export const projectSchema = z.object({
  name,
  summary: z.string().max(500).optional(),
  description,
  identifier,
  color: color.optional(),
  icon: z.string().optional(),
  status: projectStatus.default('ACTIVE'),
  startDate: z.date().optional(),
  targetDate: z.date().optional(),
  leadUserId: id.optional(),
  teamId: id,
  workspaceId: id,
});

// Project Create Schema (for API creation - workspaceId added by workspace-crud-factory)
export const projectCreateSchema = z.object({
  name,
  description,
  identifier: identifier.optional(),
  color: color.optional(),
  icon: z.string().optional(),
  status: projectStatus.default('ACTIVE'),
  startDate: dateTransform,
  targetDate: dateTransform,
  leadUserId: id.optional(),
  teamId: id,
  summary: z.string().max(500).optional(),
});

// Project Update Schema
export const projectUpdateSchema = z.object({
  name: name.optional(),
  description,
  identifier: identifier.optional(),
  color: color.optional(),
  icon: z.string().optional(),
  status: projectStatus.optional(),
  startDate: dateTransform,
  targetDate: dateTransform,
  leadUserId: id.optional(),
  teamId: id.optional(),
  summary: z.string().max(500).optional(),
});

// Type exports
export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>; 