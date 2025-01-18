export enum WorkspaceRole {
  Admin = 'ADMIN',
  Member = 'MEMBER'
}

export enum WorkspaceVisibility {
  Private = 'private',
  Public = 'public'
}

export const WORKSPACE_LIMITS = {
  maxTeams: 25,
  maxMembersPerTeam: 100,
  maxProjects: 50,
} as const 