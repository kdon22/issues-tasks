import { BaseWorkspaceHandler } from './base-handler';

export class GenericWorkspaceHandler<T> extends BaseWorkspaceHandler<T> {
  // Uses all default implementations from BaseWorkspaceHandler
  // No additional logic needed for simple models like Label, State, IssueType, etc.
} 