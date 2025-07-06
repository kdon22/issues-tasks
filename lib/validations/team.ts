// Team Validation Schemas - Linear Clone
import { z } from 'zod';
import { id, name, description, color, identifier, avatarType } from './shared';

// Team Schema
export const teamSchema = z.object({
  name,
  identifier,
  description,
  avatarType: avatarType.default('INITIALS'),
  avatarIcon: z.string().optional(),
  avatarColor: color.optional(),
  avatarEmoji: z.string().optional(),
  avatarImageUrl: z.string().url().optional(),
  workspaceId: id,
});

// Team Create Schema (for API creation - workspaceId added by workspace-crud-factory)
export const teamCreateSchema = z.object({
  name,
  identifier,
  description,
  avatarType: avatarType.default('INITIALS'),
  avatarIcon: z.string().optional(),
  avatarColor: color.optional(),
  avatarEmoji: z.string().optional(),
  avatarImageUrl: z.string().url().optional(),
});

// Team Update Schema
export const teamUpdateSchema = z.object({
  name: name.optional(),
  identifier: identifier.optional(),
  description,
  avatarType: avatarType.optional(),
  avatarIcon: z.string().optional(),
  avatarColor: color.optional(),
  avatarEmoji: z.string().optional(),
  avatarImageUrl: z.string().url().optional(),
});

// Type exports
export type TeamInput = z.infer<typeof teamSchema>;
export type TeamCreateInput = z.infer<typeof teamCreateSchema>;
export type TeamUpdateInput = z.infer<typeof teamUpdateSchema>; 