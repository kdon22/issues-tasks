// Resource type definitions for the unified resource system

// Base resource interface that all resources extend
export interface BaseResource {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Allow for additional properties
}

// Team resource
export interface Team extends BaseResource {
  identifier: string;
  description?: string;
  timezone?: string;
  isPrivate?: boolean;
  icon?: string; // Combined "iconName:color" format
  workspaceId: string;
  settings?: any;
}

// Project resource
export interface Project extends BaseResource {
  description?: string;
  icon?: string;
  color?: string;
  status: string;
  statusFlowId?: string;
  fieldSetId?: string;
  workspaceId: string;
}

// Label resource
export interface Label extends BaseResource {
  description?: string;
  color: string;
  workspaceId: string;
}

// Member resource
export interface Member extends BaseResource {
  email: string;
  role: string;
  lastName?: string;
  displayName?: string;
  icon?: string; // Combined "iconName:color" format
  avatarImageUrl?: string;
  status: 'ACTIVE' | 'PENDING' | 'DISABLED';
  teams?: { id: string; name: string; role: string }[];
}

// Issue Type resource
export interface IssueType extends BaseResource {
  description?: string;
  icon?: string;
  statusFlowId?: string;
  fieldSetId?: string;
  isDefault?: boolean;
  workspaceId: string;
}

// State resource
export interface State extends BaseResource {
  description?: string;
  icon?: string;
  color: string;
  type: string;
  position: number;
  statusFlowId: string;
}

// Issue resource
export interface Issue extends BaseResource {
  title: string;
  description?: string;
  identifier: string;
  status?: string;
  priority: string;
  assigneeId?: string;
  workspaceId: string;
  // name property comes from BaseResource (can be same as title)
}

// Comment resource (comprehensive version with relations)
export interface Comment {
  id: string;
  content: string;
  issueId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  reactions: Reaction[];
  replies?: Comment[];
}

// Reaction resource (comprehensive version with aggregated data)
export interface Reaction {
  id: string;
  emoji: string;
  count: number;
  users: {
    id: string;
    name: string | null;
    email: string;
  }[];
  hasReacted: boolean;
}

// Supporting resource types
export interface StatusFlow extends BaseResource {
  description?: string;
  color: string;
  icon?: string;
  position: number;
  isDefault: boolean;
  workspaceId: string;
}

export interface FieldSet extends BaseResource {
  description?: string;
  workspaceId: string;
  isDefault: boolean;
  fields?: any[]; // TODO: Define proper field structure
}

// Union type for all resources
export type ResourceType = Team | Project | Label | Member | IssueType | State | Issue | Comment | Reaction | StatusFlow | FieldSet;

// Resource type mapping for type safety
export interface ResourceTypeMap {
  team: Team;
  project: Project;
  label: Label;
  member: Member;
  issueType: IssueType;
  state: State;
  statusFlow: StatusFlow;
  fieldSet: FieldSet;
  issue: Issue;
  comment: Comment;
  reaction: Reaction;
}

// Helper type to get resource type from action prefix
export type ResourceFromPrefix<T extends keyof ResourceTypeMap> = ResourceTypeMap[T]; 