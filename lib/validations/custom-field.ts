// Custom Field Validation Schemas - Linear Clone
import { z } from 'zod';
import { id } from './shared';

// Custom Field Schema
export const customFieldSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'DATETIME', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'USER', 'MULTI_USER', 'URL', 'EMAIL', 'PHONE', 'CURRENCY', 'PERCENT', 'RATING', 'COLOR', 'FILE', 'RICH_TEXT']),
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
    color: z.string().optional()
  })).optional(),
  required: z.boolean().default(false),
  position: z.number().default(0),
  teamId: id.optional(),
  workspaceId: id,
  settings: z.record(z.any()).optional(),
});

// Custom Field Create Schema (for API creation - workspaceId added by workspace-crud-factory)
export const customFieldCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'DATETIME', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'USER', 'MULTI_USER', 'URL', 'EMAIL', 'PHONE', 'CURRENCY', 'PERCENT', 'RATING', 'COLOR', 'FILE', 'RICH_TEXT']),
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
    color: z.string().optional()
  })).optional(),
  required: z.boolean().default(false),
  position: z.number().default(0),
  teamId: id.optional(),
  settings: z.record(z.any()).optional(),
});

// Custom Field Update Schema
export const customFieldUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'DATETIME', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'USER', 'MULTI_USER', 'URL', 'EMAIL', 'PHONE', 'CURRENCY', 'PERCENT', 'RATING', 'COLOR', 'FILE', 'RICH_TEXT']).optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
    color: z.string().optional()
  })).optional(),
  required: z.boolean().optional(),
  position: z.number().optional(),
  teamId: id.optional(),
  settings: z.record(z.any()).optional(),
});

// Custom Field Value Schema
export const customFieldValueSchema = z.object({
  customFieldId: id,
  issueId: id,
  value: z.any(), // Flexible value based on field type
});

// Field Configuration Schema
export const fieldConfigurationSchema = z.object({
  teamId: id.optional(),
  workspaceId: id,
  fieldOrder: z.array(z.string()).default([]),
  fieldVisibility: z.record(z.boolean()).default({}),
  sectionOrder: z.array(z.string()).default(['basic', 'details', 'custom', 'attachments']),
});

// Type exports
export type CustomFieldInput = z.infer<typeof customFieldSchema>;
export type CustomFieldCreateInput = z.infer<typeof customFieldCreateSchema>;
export type CustomFieldUpdateInput = z.infer<typeof customFieldUpdateSchema>;
export type CustomFieldValueInput = z.infer<typeof customFieldValueSchema>;
export type FieldConfigurationInput = z.infer<typeof fieldConfigurationSchema>; 