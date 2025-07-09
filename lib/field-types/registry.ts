// Field Types Registry - 
// Defines all available field types for issue field sets

export interface FieldType {
  key: string;
  label: string;
  description: string;
  category: FieldCategory;
  inputType: 'text' | 'textarea' | 'select' | 'multi-select' | 'date' | 'number' | 'checkbox' | 'user-select' | 'priority' | 'state';
  required: boolean; // Whether this field is always required
  system: boolean; // Whether this is a system field (cannot be removed)
  icon: string; // Lucide icon name
  defaultValue?: any;
  options?: { label: string; value: string; color?: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
}

export type FieldCategory = 'core' | 'assignment' | 'organization' | 'planning' | 'metadata' | 'custom';

export const FIELD_CATEGORIES: Record<FieldCategory, { label: string; icon: string; description: string }> = {
  core: {
    label: 'Core Fields',
    icon: 'circle-dot',
    description: 'Essential fields for every issue'
  },
  assignment: {
    label: 'Assignment',
    icon: 'user-check',
    description: 'Who is responsible for the work'
  },
  organization: {
    label: 'Organization',
    icon: 'folder',
    description: 'Project and team organization'
  },
  planning: {
    label: 'Planning',
    icon: 'calendar',
    description: 'Timeline and effort estimation'
  },
  metadata: {
    label: 'Metadata',
    icon: 'tag',
    description: 'Additional context and categorization'
  },
  custom: {
    label: 'Custom Fields',
    icon: 'settings',
    description: 'User-defined fields'
  }
};

export const STANDARD_FIELDS: Record<string, FieldType> = {
  // Core Fields
  title: {
    key: 'title',
    label: 'Title',
    description: 'The issue title or summary',
    category: 'core',
    inputType: 'text',
    required: true,
    system: true,
    icon: 'type',
    validation: {
      required: true,
      min: 1,
      max: 255
    }
  },
  description: {
    key: 'description',
    label: 'Description',
    description: 'Detailed description of the issue',
    category: 'core',
    inputType: 'textarea',
    required: false,
    system: true,
    icon: 'align-left'
  },
  state: {
    key: 'state',
    label: 'Status',
    description: 'Current state of the issue',
    category: 'core',
    inputType: 'state',
    required: true,
    system: true,
    icon: 'circle'
  },
  priority: {
    key: 'priority',
    label: 'Priority',
    description: 'Issue priority level',
    category: 'core',
    inputType: 'priority',
    required: false,
    system: true,
    icon: 'arrow-up',
    defaultValue: 'MEDIUM'
  },

  // Assignment Fields
  assignee: {
    key: 'assignee',
    label: 'Assignee',
    description: 'Person assigned to work on this issue',
    category: 'assignment',
    inputType: 'user-select',
    required: false,
    system: true,
    icon: 'user'
  },
  creator: {
    key: 'creator',
    label: 'Creator',
    description: 'Person who created this issue',
    category: 'assignment',
    inputType: 'user-select',
    required: true,
    system: true,
    icon: 'user-plus'
  },

  // Organization Fields
  project: {
    key: 'project',
    label: 'Project',
    description: 'Project this issue belongs to',
    category: 'organization',
    inputType: 'select',
    required: false,
    system: true,
    icon: 'folder'
  },
  team: {
    key: 'team',
    label: 'Team',
    description: 'Team responsible for this issue',
    category: 'organization',
    inputType: 'select',
    required: true,
    system: true,
    icon: 'users'
  },
  labels: {
    key: 'labels',
    label: 'Labels',
    description: 'Categories and tags for organization',
    category: 'organization',
    inputType: 'multi-select',
    required: false,
    system: true,
    icon: 'tags'
  },

  // Planning Fields
  dueDate: {
    key: 'dueDate',
    label: 'Due Date',
    description: 'When this issue should be completed',
    category: 'planning',
    inputType: 'date',
    required: false,
    system: true,
    icon: 'calendar'
  },
  estimate: {
    key: 'estimate',
    label: 'Estimate',
    description: 'Story points or time estimate',
    category: 'planning',
    inputType: 'number',
    required: false,
    system: true,
    icon: 'clock',
    validation: {
      min: 0,
      max: 100
    }
  },
  startedAt: {
    key: 'startedAt',
    label: 'Started At',
    description: 'When work began on this issue',
    category: 'planning',
    inputType: 'date',
    required: false,
    system: true,
    icon: 'play'
  },
  completedAt: {
    key: 'completedAt',
    label: 'Completed At',
    description: 'When this issue was completed',
    category: 'planning',
    inputType: 'date',
    required: false,
    system: true,
    icon: 'check'
  },

  // Metadata Fields
  identifier: {
    key: 'identifier',
    label: 'Identifier',
    description: 'Unique identifier (e.g., WEB-123)',
    category: 'metadata',
    inputType: 'text',
    required: true,
    system: true,
    icon: 'hash'
  },
  parentIssue: {
    key: 'parentIssue',
    label: 'Parent Issue',
    description: 'Parent issue for subtasks',
    category: 'metadata',
    inputType: 'select',
    required: false,
    system: true,
    icon: 'link'
  }
};

// Common field sets for different issue types
export const DEFAULT_FIELD_SETS = {
  standard: {
    name: 'Standard Issue',
    description: 'Default fields for most issues',
    fields: ['title', 'description', 'state', 'priority', 'assignee', 'project', 'team', 'labels', 'dueDate', 'estimate']
  },
  bug: {
    name: 'Bug Report',
    description: 'Fields optimized for bug tracking',
    fields: ['title', 'description', 'state', 'priority', 'assignee', 'project', 'team', 'labels', 'dueDate']
  },
  feature: {
    name: 'Feature Request',
    description: 'Fields for new features and enhancements',
    fields: ['title', 'description', 'state', 'priority', 'assignee', 'project', 'team', 'labels', 'dueDate', 'estimate']
  },
  subtask: {
    name: 'Subtask',
    description: 'Minimal fields for subtasks',
    fields: ['title', 'description', 'state', 'assignee', 'dueDate', 'estimate']
  }
};

// Helper functions
export function getFieldsByCategory(category: FieldCategory): FieldType[] {
  return Object.values(STANDARD_FIELDS).filter(field => field.category === category);
}

export function getRequiredFields(): FieldType[] {
  return Object.values(STANDARD_FIELDS).filter(field => field.required);
}

export function getSystemFields(): FieldType[] {
  return Object.values(STANDARD_FIELDS).filter(field => field.system);
}

export function getFieldByKey(key: string): FieldType | undefined {
  return STANDARD_FIELDS[key];
}

export function validateFieldSet(fieldKeys: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requiredFields = getRequiredFields();
  
  // Check if all required fields are present
  for (const requiredField of requiredFields) {
    if (!fieldKeys.includes(requiredField.key)) {
      errors.push(`Required field "${requiredField.label}" is missing`);
    }
  }
  
  // Check if all field keys are valid
  for (const fieldKey of fieldKeys) {
    if (!STANDARD_FIELDS[fieldKey]) {
      errors.push(`Unknown field "${fieldKey}"`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
} 