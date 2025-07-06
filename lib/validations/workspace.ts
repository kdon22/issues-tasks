// Workspace Validation Schemas - Linear Clone
import { z } from 'zod';
import { name, color, url, avatarType } from './shared';

// Workspace Schema
export const workspaceSchema = z.object({
  name,
  url,
  avatarColor: color.optional(),
  avatarEmoji: z.string().optional(),
  avatarIcon: z.string().optional(),
  avatarImageUrl: z.string().url().optional(),
  avatarType: avatarType.default('INITIALS'),
  fiscalYearStart: z.string().optional(),
  region: z.string().optional(),
  allowGuestAccess: z.boolean().default(false),
  requireTwoFactor: z.boolean().default(false),
});

// Workspace Create Schema
export const workspaceCreateSchema = z.object({
  name,
  url,
  avatarColor: color.optional(),
  avatarEmoji: z.string().optional(),
  avatarIcon: z.string().optional(),
  avatarImageUrl: z.string().url().optional(),
  avatarType: avatarType.default('INITIALS'),
  fiscalYearStart: z.string().optional(),
  region: z.string().optional(),
  allowGuestAccess: z.boolean().default(false),
  requireTwoFactor: z.boolean().default(false),
});

// Workspace Update Schema
export const workspaceUpdateSchema = z.object({
  name: name.optional(),
  url: url.optional(),
  avatarColor: color.optional(),
  avatarEmoji: z.string().optional(),
  avatarIcon: z.string().optional(),
  avatarImageUrl: z.string().url().optional(),
  avatarType: avatarType.optional(),
  fiscalYearStart: z.string().optional(),
  region: z.string().optional(),
  allowGuestAccess: z.boolean().optional(),
  requireTwoFactor: z.boolean().optional(),
});

// Type exports
export type WorkspaceInput = z.infer<typeof workspaceSchema>;
export type WorkspaceCreateInput = z.infer<typeof workspaceCreateSchema>;
export type WorkspaceUpdateInput = z.infer<typeof workspaceUpdateSchema>; 