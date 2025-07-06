// Member Validation Schemas - Linear Clone
import { z } from 'zod';
import { id, name, email, workspaceRole, teamRole, memberStatus } from './shared';

// Member Schema
export const memberSchema = z.object({
  name,
  email,
  avatarUrl: z.string().url().optional(),
  workspaceRole: workspaceRole.default('MEMBER'),
  status: memberStatus.default('ACTIVE'),
  workspaceId: id,
});

// Member Create Schema (for API creation - workspaceId added by workspace-crud-factory)
export const memberCreateSchema = z.object({
  name,
  email,
  avatarUrl: z.string().url().optional(),
  role: workspaceRole.default('MEMBER'),
  status: z.enum(['ACTIVE', 'PENDING', 'DISABLED']).default('ACTIVE'),
});

// Member Update Schema (includes status for status updates)
export const memberUpdateSchema = z.object({
  name: name.optional(),
  email: email.optional(),
  avatarUrl: z.string().url().optional(),
  role: workspaceRole.optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'DISABLED']).optional(),
});

// Member invite schema
export const memberInviteSchema = z.object({
  email,
  workspaceRole: workspaceRole.default('MEMBER'),
  teams: z.array(z.object({
    teamId: id,
    role: teamRole.default('MEMBER'),
  })).optional(),
  workspaceId: id,
});

// Member team role update schema
export const memberTeamRoleSchema = z.object({
  teamId: id,
  role: teamRole,
});

// Type exports
export type MemberInput = z.infer<typeof memberSchema>;
export type MemberCreateInput = z.infer<typeof memberCreateSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;
export type MemberInviteInput = z.infer<typeof memberInviteSchema>;
export type MemberTeamRoleInput = z.infer<typeof memberTeamRoleSchema>; 