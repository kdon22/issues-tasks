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
  avatarIcon?: string;
  avatarType?: string;
  avatarEmoji?: string;
  avatarImageUrl?: string;
  settings?: any;
}

// Project resource
export interface Project extends BaseResource {
  description?: string;
  icon?: string;
  color?: string;
  statusFlowId?: string;
  fieldSetId?: string;
}

// Label resource
export interface Label extends BaseResource {
  description?: string;
  color?: string;
}

// Member resource
export interface Member extends BaseResource {
  email: string;
  role: string;
  lastName?: string;
  displayName?: string;
  avatarType?: string;
  avatarIcon?: string;
  avatarEmoji?: string;
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
}

// State resource
export interface State extends BaseResource {
  description?: string;
  icon?: string;
  color?: string;
  type: string;
}

// Issue resource
export interface Issue extends BaseResource {
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigneeId?: string;
  // name property comes from BaseResource (can be same as title)
}

// Comment resource (from existing code)
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  issueId: string;
  createdAt: string;
  updatedAt: string;
}

// Reaction resource (from existing code)
export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  commentId: string;
  createdAt: string;
}

// Supporting resource types
export interface StatusFlow extends BaseResource {
  description?: string;
  isDefault?: boolean;
}

export interface FieldSet extends BaseResource {
  description?: string;
  fields: any[]; // TODO: Define proper field structure
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