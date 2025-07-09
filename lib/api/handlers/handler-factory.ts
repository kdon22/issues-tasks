import { CrudConfig } from '../types';
import { BaseWorkspaceHandler } from './base-handler';
import { IssueHandler } from './issue-handler';
import { WorkspaceMemberHandler } from './workspace-member-handler';
import { GenericWorkspaceHandler } from './generic-handler';
import { prisma } from '@/lib/prisma';

export function createHandler<T>(config: CrudConfig<T>): BaseWorkspaceHandler<T> {
  // Determine handler based on model type
  if (config.model === prisma.issue) {
    return new IssueHandler(config) as BaseWorkspaceHandler<T>;
  }
  
  if (config.model === prisma.workspaceMember) {
    return new WorkspaceMemberHandler(config) as BaseWorkspaceHandler<T>;
  }
  
  // Default to generic handler for simple models
  return new GenericWorkspaceHandler<T>(config);
} 