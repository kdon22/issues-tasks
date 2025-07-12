import { ResourceSchema } from '../../lib/resource-system/schemas';

// Project-specific schema matching Prisma Project model
export const PROJECT_SCHEMA: ResourceSchema = {
  // Resource identity
  databaseKey: 'projects',
  endpoint: 'projects',
  actionPrefix: 'project',
  name: {
    singular: 'Project',
    plural: 'Projects'
  },
  
  // Desktop-first display configuration
  display: {
    title: 'Projects',
    description: 'Organize your work into projects to better track progress and manage scope',
    icon: 'FolderOpen',
    maxWidth: '6xl'
  },
  
  // Desktop-first field configuration
  fields: [
    {
      key: 'icon',
      label: 'Project icon',
      type: 'icon',
      required: false,
      mobile: {
        priority: 'high',
        displayFormat: 'icon',
        showInTable: true,
        tableWidth: 'xs'
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
      label: 'Project name',
      type: 'text',
      required: true,
      clickable: true,
      placeholder: 'e.g. Mobile App',
      mobile: {
        priority: 'high',
        displayFormat: 'text',
        showInTable: true,
        tableWidth: 'full'
      },
      desktop: {
        width: 'lg',
        sortable: true,
        filterable: true,
        showInTable: true,
        tableWidth: 'auto'
      },
      validation: [
        { type: 'required', message: 'Project name is required', mobileMessage: 'Required' },
        { type: 'minLength', value: 2, message: 'Project name must be at least 2 characters', mobileMessage: 'Too short' },
        { type: 'maxLength', value: 100, message: 'Project name must be less than 100 characters', mobileMessage: 'Too long' }
      ]
    },
    {
      key: 'summary',
      label: 'Summary',
      type: 'textarea',
      required: false,
      placeholder: 'Brief project summary...',
      mobile: {
        priority: 'low',
        displayFormat: 'text',
        condensed: true
      },
      desktop: {
        width: 'lg'
      },
      validation: [
        { type: 'maxLength', value: 500, message: 'Summary must be less than 500 characters', mobileMessage: 'Too long' }
      ]
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Detailed description of the project...',
      mobile: {
        priority: 'low',
        displayFormat: 'text',
        condensed: true
      },
      desktop: {
        width: 'xl'
      },
      validation: [
        { type: 'maxLength', value: 1000, message: 'Description must be less than 1000 characters', mobileMessage: 'Too long' }
      ]
    },
    {
      key: 'targetDate',
      label: 'Target Date',
      type: 'date',
      required: false,
      mobile: {
        priority: 'medium',
        displayFormat: 'text',
        condensed: true,
        showInTable: true,
        tableWidth: 'sm'
      },
      desktop: {
        width: 'sm',
        sortable: true,
        showInTable: true,
        tableWidth: 'sm'
      },
      validation: []
    },
    {
      key: 'teamId',
      label: 'Team',
      type: 'select',
      required: true,
      placeholder: 'Select team...',
      options: {
        resource: 'team',
        valueField: 'id',
        labelField: 'name',
        displayField: 'name'
      },
      mobile: {
        priority: 'high',
        displayFormat: 'text',
        showInTable: true,
        tableWidth: 'sm'
      },
      desktop: {
        width: 'md',
        sortable: true,
        filterable: true,
        showInTable: true,
        tableWidth: 'md'
      },
      validation: [
        { type: 'required', message: 'Team is required', mobileMessage: 'Required' }
      ]
    },
    {
      key: 'leadUserId',
      label: 'Project Lead',
      type: 'select',
      required: false,
      placeholder: 'Select project lead...',
      options: {
        resource: 'member',
        valueField: 'id',
        labelField: 'name',
        displayField: 'name'
      },
      mobile: {
        priority: 'medium',
        displayFormat: 'text',
        showInTable: true,
        tableWidth: 'sm'
      },
      desktop: {
        width: 'md',
        sortable: true,
        filterable: true,
        showInTable: true,
        tableWidth: 'md'
      },
      validation: []
    },
    {
      key: 'startDate',
      label: 'Start Date',
      type: 'date',
      required: false,
      mobile: {
        priority: 'low',
        displayFormat: 'text',
        condensed: true
      },
      desktop: {
        width: 'sm',
        sortable: true
      },
      validation: []
    },
    
    {
      key: 'completedAt',
      label: 'Completed Date',
      type: 'date',
      required: false,
      mobile: {
        priority: 'low',
        displayFormat: 'text',
        condensed: true
      },
      desktop: {
        width: 'sm',
        sortable: true
      },
      validation: []
    },
    {
      key: 'isPrivate',
      label: 'Private project',
      type: 'switch',
      required: false,
      mobile: {
        priority: 'medium',
        displayFormat: 'badge',
        tableWidth: 'xs'
      },
      desktop: {
        width: 'sm',
        tableWidth: 'xs'
      },
      validation: []
    }
  ],
  
  // Desktop-first search configuration
  search: {
    fields: ['name', 'identifier', 'description', 'summary'],
    placeholder: 'Search projects...',
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
    cardFormat: 'detailed',
    primaryField: 'name',
    secondaryFields: ['identifier', 'status', 'targetDate'],
    showSearch: true,
    showFilters: true,
    fabPosition: 'bottom-right'
  },
  
  // Desktop table configuration (primary)
  desktop: {
    sortField: 'name',
    sortOrder: 'asc',
    editableField: 'name',
    rowActions: true,
    bulkActions: true
  },
  
  // Permissions
  permissions: {
    create: 'team.member',
    update: 'project.member',
    delete: 'project.admin',
    view: 'workspace.member'
  }
};

// Export for use in components
export default PROJECT_SCHEMA; 