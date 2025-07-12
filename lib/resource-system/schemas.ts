import { ReactNode } from 'react';

// Mobile-first field configuration
export interface FieldSchema {
  key: string;
  label: string;
  type: keyof typeof FIELD_TYPES;
  required?: boolean;
  placeholder?: string;
  validation?: ValidationRule[];
  clickable?: boolean; // Make column clickable for editing
  mobile?: {
    priority: 'high' | 'medium' | 'low'; // Controls visibility in mobile cards
    displayFormat?: 'badge' | 'text' | 'icon' | 'hidden';
    condensed?: boolean; // Use condensed display in mobile
    showInTable?: boolean;
    tableWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
  };
  desktop?: {
    width?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
    sortable?: boolean;
    filterable?: boolean;
    showInTable?: boolean;
    tableWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
  };
  options?: Array<{ label: string; value: string; icon?: string }> | {
    resource: string;       // actionPrefix of the resource to load options from
    valueField: string;     // field to use as option value (usually 'id')
    labelField: string;     // field to use as option label (usually 'name')
    displayField?: string;  // field to use for display (optional, defaults to labelField)
    filter?: (item: any) => boolean; // optional filter function
  };
}

// Mobile-optimized resource schema
export interface ResourceSchema {
  // Resource identity
  databaseKey: string;
  endpoint: string;
  actionPrefix: string;
  name: {
    singular: string;
    plural: string;
  };
  
  // Display configuration
  display: {
    title: string;
    description: string;
    icon?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  };
  
  // Mobile-first field configuration
  fields: FieldSchema[];
  
  // Search and sorting (mobile-optimized)
  search: {
    fields: string[];
    placeholder?: string;
    mobileFilters?: boolean; // Show filters in mobile
  };
  
  // Mobile-first actions
  actions: {
    create?: boolean;
    update?: boolean;
    delete?: boolean;
    duplicate?: boolean;
    bulk?: boolean; // Mobile-friendly bulk actions
    custom?: Array<{
      key: string;
      label: string;
      icon: string;
      mobileOnly?: boolean;
      handler: string;
    }>;
  };
  
  // Mobile layout configuration
  mobile: {
    cardFormat: 'compact' | 'detailed' | 'custom';
    primaryField: string; // Main field to show in mobile cards
    secondaryFields: string[]; // Additional fields in mobile
    showSearch: boolean;
    showFilters: boolean;
    fabPosition: 'bottom-right' | 'bottom-center' | 'bottom-left';
  };
  
  // Desktop table configuration
  desktop: {
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    editableField?: string; // Click to edit
    rowActions?: boolean;
    bulkActions?: boolean;
  };
  
  // Permissions
  permissions: {
    create?: string;
    update?: string;
    delete?: string;
    view?: string;
  };
}

// Validation rules system
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'min' | 'max' | 'custom';
  value?: any;
  message: string;
  mobileMessage?: string; // Shorter message for mobile
}

// Field type registry for mobile-first rendering
export const FIELD_TYPES = {
  text: {
    input: 'TextInput',
    display: 'TextDisplay',
    mobileOptimized: true,
    validation: ['required', 'minLength', 'maxLength', 'pattern']
  },
  textarea: {
    input: 'TextareaInput',
    display: 'TextDisplay',
    mobileOptimized: true,
    validation: ['required', 'minLength', 'maxLength']
  },
  select: {
    input: 'SelectInput',
    display: 'BadgeDisplay',
    mobileOptimized: true,
    validation: ['required']
  },
  multiSelect: {
    input: 'MultiSelectInput',
    display: 'BadgeListDisplay',
    mobileOptimized: true,
    validation: ['required']
  },
  switch: {
    input: 'SwitchInput',
    display: 'BadgeDisplay',
    mobileOptimized: true,
    validation: []
  },
  number: {
    input: 'NumberInput',
    display: 'TextDisplay',
    mobileOptimized: true,
    validation: ['required', 'min', 'max']
  },
  color: {
    input: 'ColorInput',
    display: 'ColorDisplay',
    mobileOptimized: true,
    validation: ['required']
  },
  icon: {
    input: 'IconInput',
    display: 'IconDisplay',
    mobileOptimized: true,
    validation: []
  },
  email: {
    input: 'EmailInput',
    display: 'TextDisplay',
    mobileOptimized: true,
    validation: ['required', 'email']
  },
  url: {
    input: 'UrlInput',
    display: 'LinkDisplay',
    mobileOptimized: true,
    validation: ['required', 'url']
  },
  date: {
    input: 'DateInput',
    display: 'DateDisplay',
    mobileOptimized: true,
    validation: ['required']
  },
  avatar: {
    input: 'AvatarInput',
    display: 'AvatarDisplay',
    mobileOptimized: true,
    validation: []
  }
} as const;

// Common field patterns for reuse
export const COMMON_FIELDS = {
  name: {
    key: 'name',
    label: 'Name',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter name...',
    mobile: {
      priority: 'high' as const,
      displayFormat: 'text' as const
    },
    desktop: {
      width: 'lg' as const,
      sortable: true,
      filterable: true
    },
    validation: [
      { type: 'required' as const, message: 'Name is required', mobileMessage: 'Required' },
      { type: 'minLength' as const, value: 2, message: 'Name must be at least 2 characters', mobileMessage: 'Too short' },
      { type: 'maxLength' as const, value: 50, message: 'Name must be less than 50 characters', mobileMessage: 'Too long' }
    ]
  },
  
  identifier: {
    key: 'identifier',
    label: 'Identifier',
    type: 'text' as const,
    required: true,
    placeholder: 'e.g. ENG',
    mobile: {
      priority: 'medium' as const,
      displayFormat: 'badge' as const
    },
    desktop: {
      width: 'sm' as const,
      sortable: true
    },
    validation: [
      { type: 'required' as const, message: 'Identifier is required', mobileMessage: 'Required' },
      { type: 'minLength' as const, value: 2, message: 'Identifier must be at least 2 characters', mobileMessage: 'Too short' },
      { type: 'maxLength' as const, value: 4, message: 'Identifier must be at most 4 characters', mobileMessage: 'Too long' },
      { type: 'pattern' as const, value: /^[A-Z0-9]+$/, message: 'Identifier must contain only uppercase letters and numbers', mobileMessage: 'Invalid format' }
    ]
  },
  
  description: {
    key: 'description',
    label: 'Description',
    type: 'textarea' as const,
    required: false,
    placeholder: 'Brief description...',
    mobile: {
      priority: 'low' as const,
      displayFormat: 'text' as const,
      condensed: true
    },
    desktop: {
      width: 'xl' as const
    },
    validation: [
      { type: 'maxLength' as const, value: 500, message: 'Description must be less than 500 characters', mobileMessage: 'Too long' }
    ]
  },
  
  color: {
    key: 'color',
    label: 'Color',
    type: 'color' as const,
    required: false,
    mobile: {
      priority: 'medium' as const,
      displayFormat: 'icon' as const
    },
    desktop: {
      width: 'sm' as const
    },
    options: [
      { label: 'Blue', value: '#3B82F6' },
      { label: 'Green', value: '#10B981' },
      { label: 'Red', value: '#EF4444' },
      { label: 'Yellow', value: '#F59E0B' },
      { label: 'Purple', value: '#8B5CF6' },
      { label: 'Pink', value: '#EC4899' },
      { label: 'Gray', value: '#6B7280' }
    ]
  },
  
  icon: {
    key: 'icon',
    label: 'Icon',
    type: 'icon' as const,
    required: false,
    mobile: {
      priority: 'high' as const,
      displayFormat: 'icon' as const
    },
    desktop: {
      width: 'sm' as const
    }
  },
  
  isPrivate: {
    key: 'isPrivate',
    label: 'Private',
    type: 'switch' as const,
    required: false,
    mobile: {
      priority: 'medium' as const,
      displayFormat: 'badge' as const
    },
    desktop: {
      width: 'sm' as const
    }
  },
  
  isArchived: {
    key: 'isArchived',
    label: 'Archived',
    type: 'switch' as const,
    required: false,
    mobile: {
      priority: 'low' as const,
      displayFormat: 'badge' as const
    },
    desktop: {
      width: 'sm' as const
    }
  }
} as const;

// Export type helpers
export type FieldType = keyof typeof FIELD_TYPES;
export type CommonFieldKey = keyof typeof COMMON_FIELDS; 