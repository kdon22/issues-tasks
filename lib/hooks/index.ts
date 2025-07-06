// Hooks - Linear Clone (DRY Resource Hooks)
export * from './use-resource';
export * from './use-auto-save';
export * from './use-editable-auto-save';
export * from './use-keyboard-shortcuts';
export * from './use-permissions';
export * from './use-current-workspace';
export * from './use-rich-text-auto-save';

// Import useResource for direct use
import { useResource } from './use-resource';

// Simple resource configs for client-side data fetching
const resourceConfigs = {
  issues: { endpoint: '/api/issues' },
  projects: { endpoint: '/api/projects' },
  teams: { endpoint: '/api/teams' },
  workspaces: { endpoint: '/api/workspace' },
  states: { endpoint: '/api/states' },
  labels: { endpoint: '/api/labels' },
  customFields: { endpoint: '/api/custom-fields' },
  fieldConfigurations: { endpoint: '/api/field-configurations' },
  issueTypes: { endpoint: '/api/issue-types' },
};

// Convenience hooks for specific resources
export const useIssues = () => useResource(resourceConfigs.issues);
export const useProjects = () => useResource(resourceConfigs.projects);
export const useTeams = () => useResource(resourceConfigs.teams);
export const useWorkspaces = () => useResource(resourceConfigs.workspaces);
export const useStates = () => useResource(resourceConfigs.states);
export const useLabels = () => useResource(resourceConfigs.labels);
export const useCustomFields = () => useResource(resourceConfigs.customFields);
export const useFieldConfigurations = () => useResource(resourceConfigs.fieldConfigurations);
export const useIssueTypes = () => useResource(resourceConfigs.issueTypes);

// CRUD hooks for issues
export const useCreateIssue = () => useResource(resourceConfigs.issues).create;
export const useUpdateIssue = () => useResource(resourceConfigs.issues).update;
export const useDeleteIssue = () => useResource(resourceConfigs.issues).delete; 