// DEPRECATED: This file now re-exports from the new features/ structure
// TODO: Update all imports to use features/ directly

// Core Feature Schemas (moved to features/)
export { TEAM_SCHEMA } from '../../features/teams/teams.schema';
export { PROJECT_SCHEMA } from '../../features/projects/projects.schema';
export { MEMBER_SCHEMA } from '../../features/members/members.schema';

// Admin Feature Schemas (moved to features/admin/)
export { LABEL_SCHEMA } from '../../features/admin/labels/labels.schema';
export { ISSUE_TYPE_SCHEMA } from '../../features/admin/issue-types/schema';
export { STATE_SCHEMA } from '../../features/admin/statuses/schema';

// Type-safe schema registry (updated paths)
export const RESOURCE_SCHEMAS = {
  teams: () => import('../../features/teams/teams.schema').then(m => m.TEAM_SCHEMA),
  projects: () => import('../../features/projects/projects.schema').then(m => m.PROJECT_SCHEMA),
  members: () => import('../../features/members/members.schema').then(m => m.MEMBER_SCHEMA),
  labels: () => import('../../features/admin/labels/labels.schema').then(m => m.LABEL_SCHEMA),
  'issue-types': () => import('../../features/admin/issue-types/schema').then(m => m.ISSUE_TYPE_SCHEMA),
  states: () => import('../../features/admin/statuses/schema').then(m => m.STATE_SCHEMA)
} as const;

// Utility function to get schema by key
export async function getResourceSchema(key: keyof typeof RESOURCE_SCHEMAS) {
  const schemaLoader = RESOURCE_SCHEMAS[key];
  return await schemaLoader();
}

// Export all schema types for TypeScript
export type { ResourceSchema, FieldSchema, ValidationRule } from '../resource-system/schemas'; 