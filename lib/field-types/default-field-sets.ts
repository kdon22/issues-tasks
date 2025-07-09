// Default Field Set - 
// Creates a single default field set with essential fields

import { prisma } from '@/lib/prisma';

export const DEFAULT_FIELD_SET = {
  name: 'Default',
  description: 'Standard fields for all issues',
  isDefault: true,
  configurations: [
    { fieldKey: 'title', isRequired: true, isVisible: true, showOnSubtask: true, showOnNewIssue: true, displayOrder: 0 },
    { fieldKey: 'description', isRequired: false, isVisible: true, showOnSubtask: true, showOnNewIssue: true, displayOrder: 1 },
    { fieldKey: 'state', isRequired: true, isVisible: true, showOnSubtask: true, showOnNewIssue: true, displayOrder: 2 },
    { fieldKey: 'priority', isRequired: false, isVisible: true, showOnSubtask: false, showOnNewIssue: true, displayOrder: 3 },
    { fieldKey: 'assignee', isRequired: false, isVisible: true, showOnSubtask: true, showOnNewIssue: true, displayOrder: 4 },
    { fieldKey: 'team', isRequired: true, isVisible: true, showOnSubtask: false, showOnNewIssue: true, displayOrder: 5 },
    { fieldKey: 'labels', isRequired: false, isVisible: true, showOnSubtask: false, showOnNewIssue: true, displayOrder: 6 },
    { fieldKey: 'dueDate', isRequired: false, isVisible: true, showOnSubtask: true, showOnNewIssue: false, displayOrder: 7 }
  ]
};

export async function createDefaultFieldSet(workspaceId: string) {
  // Check if default field set already exists
  const existingDefault = await prisma.fieldSet.findFirst({
    where: {
      workspaceId,
      isDefault: true
    }
  });

  if (existingDefault) {
    return existingDefault;
  }

  // Create the default field set
  const defaultFieldSet = await prisma.fieldSet.create({
    data: {
      name: DEFAULT_FIELD_SET.name,
      description: DEFAULT_FIELD_SET.description,
      workspaceId,
      isDefault: true
    }
  });

  // Create the field configurations
  await prisma.fieldSetConfiguration.createMany({
    data: DEFAULT_FIELD_SET.configurations.map((config) => ({
      fieldSetId: defaultFieldSet.id,
      fieldKey: config.fieldKey,
      isRequired: config.isRequired,
      isVisible: config.isVisible,
      showOnSubtask: config.showOnSubtask,
      showOnNewIssue: config.showOnNewIssue,
      displayOrder: config.displayOrder,
      context: 'create'
    }))
  });

  return defaultFieldSet;
}

export async function getFieldSetForIssueType(issueTypeId: string, workspaceId: string) {
  // Get the field set associated with this issue type
  const issueType = await prisma.issueType.findFirst({
    where: {
      id: issueTypeId,
      workspaceId
    },
    include: {
      fieldSet: {
        include: {
          configurations: {
            orderBy: {
              displayOrder: 'asc'
            }
          }
        }
      }
    }
  });

  if (issueType?.fieldSet) {
    return issueType.fieldSet;
  }

  // Fall back to default field set
  const defaultFieldSet = await prisma.fieldSet.findFirst({
    where: {
      workspaceId,
      isDefault: true
    },
    include: {
      configurations: {
        orderBy: {
          displayOrder: 'asc'
        }
      }
    }
  });

  return defaultFieldSet;
}

export async function getFieldsForContext(
  fieldSetId: string, 
  context: 'create' | 'edit' | 'view' | 'subtask_create'
) {
  const configurations = await prisma.fieldSetConfiguration.findMany({
    where: {
      fieldSetId,
      OR: [
        { context },
        { context: 'create' } // Default context
      ],
      isVisible: true,
      ...(context === 'subtask_create' ? { showOnSubtask: true } : {}),
      ...(context === 'create' ? { showOnNewIssue: true } : {})
    },
    orderBy: {
      displayOrder: 'asc'
    }
  });

  return configurations;
} 