import { prisma } from '@/lib/prisma';

export type RelationKey = 
  | 'workspace'
  | 'user'
  | 'members'
  | 'labels'
  | '_count'
  | string;

export interface RelationConfig {
  [key: string]: boolean | RelationConfig;
}

export interface ModelRelationMap {
  [modelName: string]: {
    [relationKey in RelationKey]?: RelationConfig;
  };
}

export const RELATION_CONFIGS: ModelRelationMap = {
  team: {
    workspace: {
      select: {
        id: true,
        name: true,
        url: true,
      },
    },
    _count: {
      select: {
        issues: true,
        projects: true,
        members: true,
      },
    },
  },
  
  workspaceMember: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    },
    workspace: {
      select: {
        id: true,
        name: true,
        url: true,
      },
    },
  },
  
  issue: {
    workspace: {
      select: {
        id: true,
        name: true,
        url: true,
      },
    },
    labels: {
      include: {
        label: {
          select: {
            id: true,
            name: true,
            color: true,
            description: true,
          },
        },
      },
    },
    _count: {
      select: {
        comments: true,
        attachments: true,
      },
    },
  },
  
  // Default config for simple models (labels, states, issueTypes)
  default: {
    workspace: {
      select: {
        id: true,
        name: true,
        url: true,
      },
    },
    _count: {
      select: {
        issues: true,
      },
    },
  },
};

export function getModelName(model: any): string {
  // Extract model name from Prisma model delegate
  if (model === prisma.team) return 'team';
  if (model === prisma.workspaceMember) return 'workspaceMember';
  if (model === prisma.issue) return 'issue';
  if (model === prisma.label) return 'label';
  if (model === prisma.state) return 'state';
  if (model === prisma.issueType) return 'issueType';
  if (model === prisma.project) return 'project';
  
  return 'default';
} 