// State Validation Schemas - Linear Clone
import { z } from 'zod';
import { id, name, description, color, stateType } from './shared';

// State Schema
export const stateSchema = z.object({
  name,
  description,
  color,
  type: stateType,
  position: z.number().default(0),
  statusFlowId: id,
});

// State Create Schema (for API creation - statusFlowId added by status-flow-crud-factory)
export const stateCreateSchema = z.object({
  name,
  description,
  color,
  type: stateType,
  position: z.number().default(0),
});

// State Update Schema
export const stateUpdateSchema = z.object({
  name: name.optional(),
  description,
  color: color.optional(),
  type: stateType.optional(),
  position: z.number().optional(),
});

// Type exports
export type StateInput = z.infer<typeof stateSchema>;
export type StateCreateInput = z.infer<typeof stateCreateSchema>;
export type StateUpdateInput = z.infer<typeof stateUpdateSchema>; 