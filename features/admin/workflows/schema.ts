import { z } from 'zod';
import { ResourceSchema, ValidationRule } from '@/lib/resource-system/schemas';

// State validation schema
const StateValidationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'State name is required'),
  description: z.string().optional(),
  type: z.enum(['BACKLOG', 'UNSTARTED', 'STARTED', 'COMPLETED', 'CANCELED']),
  color: z.string().min(1, 'Color is required'),
  position: z.number().int().min(0),
  statusFlowId: z.string().min(1, 'Status Flow is required'),
  workspaceId: z.string().min(1, 'Workspace is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// StatusFlow validation schema
const StatusFlowValidationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Status Flow name is required'),
  description: z.string().optional(),
  workspaceId: z.string().min(1, 'Workspace is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  states: z.array(StateValidationSchema).optional(),
});

export const STATUS_FLOW_SCHEMA: ResourceSchema = {
  databaseKey: 'statusFlows',
  endpoint: 'status-flows',
  actionPrefix: 'statusFlow',
  name: {
    singular: 'Status Flow',
    plural: 'Status Flows'
  },
  display: {
    title: 'Status Flows',
    description: 'Manage status flows and their workflow states',
    icon: 'GitBranch',
    maxWidth: 'full'
  },
  fields: [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'Enter status flow name...',
      mobile: {
        priority: 'high',
        displayFormat: 'text'
      },
      desktop: {
        width: 'lg',
        sortable: true,
        filterable: true
      },
      validation: [
        { type: 'required', message: 'Name is required', mobileMessage: 'Required' },
        { type: 'minLength', value: 2, message: 'Name must be at least 2 characters', mobileMessage: 'Too short' }
      ]
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe this status flow...',
      mobile: {
        priority: 'medium',
        displayFormat: 'text'
      },
      desktop: {
        width: 'xl',
        sortable: false,
        filterable: false
      },
      validation: []
    }
  ],
  search: {
    fields: ['name', 'description'],
    placeholder: 'Search status flows...',
    mobileFilters: true
  },
  actions: {
    create: true,
    update: true,
    delete: true,
    duplicate: false,
    bulk: false
  },
  mobile: {
    cardFormat: 'compact',
    primaryField: 'name',
    secondaryFields: ['description'],
    showSearch: true,
    showFilters: false,
    fabPosition: 'bottom-right'
  },
  desktop: {
    sortField: 'name',
    sortOrder: 'asc',
    editableField: 'name',
    rowActions: true,
    bulkActions: false
  },
  permissions: {
    create: 'ADMIN',
    update: 'ADMIN',
    delete: 'ADMIN',
    view: 'MEMBER'
  }
};

// State schema for individual state management
export const STATE_SCHEMA: ResourceSchema = {
  databaseKey: 'states',
  endpoint: 'states',
  actionPrefix: 'state',
  name: {
    singular: 'State',
    plural: 'States'
  },
  display: {
    title: 'States',
    description: 'Manage status states within workflows',
    icon: 'Circle',
    maxWidth: 'full'
  },
  fields: [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'Enter state name...',
      mobile: {
        priority: 'high',
        displayFormat: 'text'
      },
      desktop: {
        width: 'lg',
        sortable: true,
        filterable: true
      },
      validation: [
        { type: 'required', message: 'Name is required', mobileMessage: 'Required' },
        { type: 'minLength', value: 2, message: 'Name must be at least 2 characters', mobileMessage: 'Too short' }
      ]
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options: [
        { value: 'BACKLOG', label: 'Backlog' },
        { value: 'UNSTARTED', label: 'Unstarted' },
        { value: 'STARTED', label: 'Started' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELED', label: 'Canceled' }
      ],
      mobile: {
        priority: 'high',
        displayFormat: 'badge'
      },
      desktop: {
        width: 'md',
        sortable: true,
        filterable: true
      },
      validation: [
        { type: 'required', message: 'Type is required', mobileMessage: 'Required' }
      ]
    },
    {
      key: 'color',
      label: 'Color',
      type: 'color',
      required: true,
      mobile: {
        priority: 'medium',
        displayFormat: 'badge'
      },
      desktop: {
        width: 'sm',
        sortable: false,
        filterable: false
      },
      validation: [
        { type: 'required', message: 'Color is required', mobileMessage: 'Required' }
      ]
    },
    {
      key: 'position',
      label: 'Position',
      type: 'number',
      required: true,
      mobile: {
        priority: 'low',
        displayFormat: 'text'
      },
      desktop: {
        width: 'sm',
        sortable: true,
        filterable: false
      },
      validation: [
        { type: 'required', message: 'Position is required', mobileMessage: 'Required' },
        { type: 'min', value: 0, message: 'Position must be 0 or greater', mobileMessage: 'Invalid' }
      ]
    }
  ],
  search: {
    fields: ['name'],
    placeholder: 'Search states...',
    mobileFilters: true
  },
  actions: {
    create: true,
    update: true,
    delete: true,
    duplicate: false,
    bulk: true
  },
  mobile: {
    cardFormat: 'compact',
    primaryField: 'name',
    secondaryFields: ['type', 'color'],
    showSearch: true,
    showFilters: false,
    fabPosition: 'bottom-right'
  },
  desktop: {
    sortField: 'position',
    sortOrder: 'asc',
    editableField: 'name',
    rowActions: true,
    bulkActions: true
  },
  permissions: {
    create: 'ADMIN',
    update: 'ADMIN',
    delete: 'ADMIN',
    view: 'MEMBER'
  }
};

// Export validation schemas for use in other parts of the system
export { StatusFlowValidationSchema, StateValidationSchema }; 