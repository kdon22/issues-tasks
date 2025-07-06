// Barrel Export for Validation Schemas - Linear Clone
// This file re-exports all validation schemas from domain-specific files

// Shared primitives
export * from './shared';

// Domain-specific schemas
export * from './project';
export * from './team';
export * from './issue';
export * from './user';
export * from './workspace';
export * from './label';
export * from './state';
export * from './member';
export * from './custom-field';
export * from './issue-type';
export * from './comment';

// Legacy exports for backward compatibility (if needed)
// These can be removed once all imports are updated
export { projectSchema as legacyProjectSchema } from './project';
export { teamSchema as legacyTeamSchema } from './team';
export { issueSchema as legacyIssueSchema } from './issue';
export { userSchema as legacyUserSchema } from './user';
export { workspaceSchema as legacyWorkspaceSchema } from './workspace';