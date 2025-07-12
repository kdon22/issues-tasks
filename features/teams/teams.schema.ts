import { z } from 'zod';

// 1. Validation Schema
export const TeamValidationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  identifier: z.string().min(1, 'Identifier is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  timezone: z.string().optional(),
  isPrivate: z.boolean().optional()
});

// 2. Database Schema
export const TEAM_DATABASE_SCHEMA = {
  model: 'Team',
  fields: {
    id: { type: 'String', id: true, default: 'cuid()' },
    name: { type: 'String' },
    identifier: { type: 'String', unique: true },
    description: { type: 'String', optional: true },
    icon: { type: 'String', optional: true },
    timezone: { type: 'String', optional: true },
    isPrivate: { type: 'Boolean', default: false },
    workspaceId: { type: 'String' }
  },
  relations: {
    workspace: { type: 'belongsTo', model: 'Workspace', foreignKey: 'workspaceId' },
    members: { type: 'hasMany', model: 'WorkspaceMember', foreignKey: 'teamId' },
    projects: { type: 'hasMany', model: 'Project', through: 'ProjectTeam' }
  }
};

// 3. Complete Resource Schema (SSOT)
export const TEAM_SCHEMA = {
  // Factory integration
  databaseKey: 'teams',
  endpoint: 'teams',
  actionPrefix: 'team',
  name: { singular: 'Team', plural: 'Teams' },
  
  // UI Configuration
  display: {
    title: 'Teams',
    description: 'Manage teams to organize workspace members',
    icon: 'Users'
  },
  
  // Field definitions
  fields: [
    {
      key: 'icon',
      label: '',
      type: 'icon',
      required: false,
      mobile: {
        priority: 'medium',
        displayFormat: 'icon',
        showInTable: true,
        tableWidth: 'xs'
      },
      desktop: {
        width: 'xs',
        sortable: false,
        showInTable: true,
        tableWidth: 'xs'
      }
    },
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      clickable: true, // Make this column clickable for editing
      mobile: {
        priority: 'high',
        displayFormat: 'text',
        showInTable: true,
        tableWidth: 'full' // Takes full width on mobile
      },
      desktop: {
        width: 'lg',
        sortable: true,
        filterable: true,
        showInTable: true,
        tableWidth: 'auto' // Auto-size on desktop
      },
      validation: [
        { type: 'required', message: 'Name is required' },
        { type: 'minLength', value: 2, message: 'Too short' }
      ]
    },
    {
      key: 'identifier',
      label: 'Identifier',
      type: 'text',
      required: true,
      mobile: {
        priority: 'high',
        displayFormat: 'badge',
        showInTable: true,
        tableWidth: 'sm'
      },
      desktop: {
        width: 'sm',
        sortable: true,
        filterable: true,
        showInTable: true,
        tableWidth: 'sm'
      },
      validation: [
        { type: 'required', message: 'Identifier is required' },
        { type: 'minLength', value: 2, message: 'Too short' }
      ]
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      mobile: {
        priority: 'low',
        displayFormat: 'text',
        showInTable: false, // Hide on mobile table
        condensed: true
      },
      desktop: {
        width: 'lg',
        sortable: false,
        filterable: false,
        showInTable: true,
        tableWidth: 'xl' // Larger on desktop
      },
      validation: [
        { type: 'maxLength', value: 500, message: 'Too long' }
      ]
    },
    {
      key: 'timezone',
      label: 'Timezone',
      type: 'select',
      required: false,
      options: [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'Eastern Time' },
        { value: 'America/Chicago', label: 'Central Time' },
        { value: 'America/Denver', label: 'Mountain Time' },
        { value: 'America/Los_Angeles', label: 'Pacific Time' },
        { value: 'Europe/London', label: 'London' },
        { value: 'Europe/Paris', label: 'Paris' },
        { value: 'Asia/Tokyo', label: 'Tokyo' },
        { value: 'Asia/Shanghai', label: 'Shanghai' },
        { value: 'Australia/Sydney', label: 'Sydney' }
      ],
      mobile: {
        priority: 'low',
        displayFormat: 'text',
      },
      desktop: {
        width: 'md',
        sortable: true,
        filterable: true,
        tableWidth: 'md'
      }
    },
    {
      key: 'isPrivate',
      label: 'Private',
      type: 'switch',
      required: false,
      mobile: {
        priority: 'medium',
        displayFormat: 'badge',
        tableWidth: 'xs'
      },
      desktop: {
        width: 'xs',
        sortable: true,
        filterable: true,
        tableWidth: 'xs'
      }
    }
  ],
  
  // Search configuration
  search: {
    fields: ['name', 'identifier', 'description'],
    placeholder: 'Search teams...'
  },
  
  // Actions
  actions: {
    create: true,
    update: true,
    delete: true,
    duplicate: false,
    bulk: true
  },
  
  // Permissions
  permissions: {
    create: 'workspace.admin',
    update: 'team.member',
    delete: 'workspace.admin'
  },
  
  // Business Logic
  businessLogic: {
    beforeCreate: (data: any) => {
      // Custom validation or transformations
      return data;
    },
    afterUpdate: (data: any) => {
      // Custom post-update logic
      return data;
    }
  }
};

// 4. Export SSOT
export default TEAM_SCHEMA; 