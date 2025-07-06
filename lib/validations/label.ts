// Label Validation Schemas - Linear Clone
import { z } from 'zod';
import { id, name, description, color } from './shared';

// Label Schema
export const labelSchema = z.object({
  name,
  description,
  color,
  teamId: id.optional(),
  workspaceId: id,
  parentId: id.optional(), // For label groups
});

// Label Create Schema (for API creation - workspaceId added by workspace-crud-factory)
export const labelCreateSchema = z.object({
  name,
  description,
  color,
  teamId: id.optional(),
  parentId: id.optional(), // For label groups
});

// Label Update Schema
export const labelUpdateSchema = z.object({
  name: name.optional(),
  description,
  color: color.optional(),
  teamId: id.optional(),
  parentId: id.optional(),
});

// Type exports
export type LabelInput = z.infer<typeof labelSchema>;
export type LabelCreateInput = z.infer<typeof labelCreateSchema>;
export type LabelUpdateInput = z.infer<typeof labelUpdateSchema>; 