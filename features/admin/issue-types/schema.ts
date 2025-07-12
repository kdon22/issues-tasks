import { ResourceSchema } from '../../../lib/resource-system/schemas';

// Issue Type-specific schema matching Prisma IssueType model
export const ISSUE_TYPE_SCHEMA: ResourceSchema = {
  // Resource identity
  databaseKey: 'issueTypes',
  endpoint: 'issue-types',
  actionPrefix: 'issueType',
  name: {
    singular: 'Issue Type',
    plural: 'Issue Types'
  },
  
  // Desktop-first display configuration
  display: {
    title: 'Issue Types',
    description: 'Define different types of work items (bugs, features, tasks, etc.)',
    icon: 'FileText',
    maxWidth: '5xl'
  },
  
  // Desktop-first field configuration
  fields: [
    {
      key: 'icon',
      label: 'Icon',
      type: 'icon',
      required: false,
      mobile: {
        priority: 'high',
        displayFormat: 'icon'
      },
      desktop: {
        width: 'sm',
        showInTable: true,
        tableWidth: 'xs'
      },
      validation: []
    },
    {
      key: 'name',
      label: 'Type name',
      type: 'text',
      required: true,
      placeholder: 'e.g. Bug, Feature, Task',
      mobile: {
        priority: 'high',
        displayFormat: 'text',
        showInTable: true,
        tableWidth: 'md'
      },
      desktop: {
        width: 'md',
        sortable: true,
        filterable: true,
        showInTable: true,
        tableWidth: 'md'
      },
      validation: [
        { type: 'required', message: 'Issue type name is required', mobileMessage: 'Required' },
        { type: 'minLength', value: 1, message: 'Issue type name must be at least 1 character', mobileMessage: 'Too short' },
        { type: 'maxLength', value: 50, message: 'Issue type name must be less than 50 characters', mobileMessage: 'Too long' }
      ]
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Brief description of this issue type...',
      mobile: {
        priority: 'low',
        displayFormat: 'text',
        condensed: true
      },
      desktop: {
        width: 'lg',
        showInTable: true
      },
      validation: [
        { type: 'maxLength', value: 500, message: 'Description must be less than 500 characters', mobileMessage: 'Too long' }
      ]
    },
    {
      key: 'statusFlowId',
      label: 'Status Flow',
      type: 'select',
      required: true,
      placeholder: 'Select status flow...',
      mobile: {
        priority: 'high',
        displayFormat: 'text'
      },
      desktop: {
        width: 'md',
        sortable: true,
        filterable: true
      },
      validation: [
        { type: 'required', message: 'Status flow is required', mobileMessage: 'Required' }
      ]
    }
  ],
  
  // Desktop-first search configuration
  search: {
    fields: ['name', 'description'],
    placeholder: 'Search issue types...',
    mobileFilters: true
  },
  
  // Desktop-first actions
  actions: {
    create: true,
    update: true,
    delete: true,
    duplicate: true,
    bulk: true
  },
  
  // Mobile responsive configuration (secondary to desktop)
  mobile: {
    cardFormat: 'compact',
    primaryField: 'name',
    secondaryFields: ['description'],
    showSearch: true,
    showFilters: false,
    fabPosition: 'bottom-right'
  },
  
  // Desktop table configuration (primary)
  desktop: {
    sortField: 'order',
    sortOrder: 'asc',
    editableField: 'name',
    rowActions: true,
    bulkActions: true
  },
  
  // Permissions
  permissions: {
    create: 'workspace.admin',
    update: 'workspace.admin',
    delete: 'workspace.admin',
    view: 'workspace.member'
  }
};

// Export for use in components
export default ISSUE_TYPE_SCHEMA; 