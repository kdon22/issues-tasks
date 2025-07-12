import { ResourceSchema } from '../../lib/resource-system/schemas';

// Member-specific schema matching Prisma WorkspaceMember + User models
export const MEMBER_SCHEMA: ResourceSchema = {
  // Resource identity
  databaseKey: 'members',
  endpoint: 'members',
  actionPrefix: 'member',
  name: {
    singular: 'Member',
    plural: 'Members'
  },
  
  // Desktop-first display configuration
  display: {
    title: 'Members',
    description: 'Manage workspace members and their roles',
    icon: 'Users',
    maxWidth: '6xl'
  },
  
  // Desktop-first field configuration
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
        width: 'sm',
        sortable: false,
        showInTable: true,
        tableWidth: 'xs'
      }
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'user@company.com',
      mobile: {
        priority: 'high',
        displayFormat: 'text'
      },
      desktop: {
        width: 'lg',
        sortable: true,
        filterable: true,
        showInTable: true,
        tableWidth: 'lg'
      },
      validation: [
        { type: 'required', message: 'Email is required', mobileMessage: 'Required' },
        { type: 'email', message: 'Please enter a valid email address', mobileMessage: 'Invalid email' }
      ]
    },
    {
      key: 'name',
      label: 'Display Name',
      type: 'text',
      required: false,
      placeholder: 'John Doe',
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
        { type: 'maxLength', value: 100, message: 'Name must be less than 100 characters', mobileMessage: 'Too long' }
      ]
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      mobile: {
        priority: 'high',
        displayFormat: 'badge'
      },
      desktop: {
        width: 'sm',
        sortable: true,
        filterable: true,
        showInTable: true,
        tableWidth: 'sm'
      },
      options: [
        { label: 'Owner', value: 'OWNER' },
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Member', value: 'MEMBER' },
        { label: 'Viewer', value: 'VIEWER' }
      ],
      validation: [
        { type: 'required', message: 'Role is required', mobileMessage: 'Required' }
      ]
    },
    {
      key: 'teamId',
      label: 'Team',
      type: 'select',
      required: false,
      placeholder: 'Select team...',
      mobile: {
        priority: 'medium',
        displayFormat: 'badge'
      },
      desktop: {
        width: 'md',
        sortable: true,
        filterable: true
      },
      validation: []
    },
    {
      key: 'createdAt',
      label: 'Joined Date',
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
    }
  ],
  
  // Desktop-first search configuration
  search: {
    fields: ['email', 'name'],
    placeholder: 'Search members...',
    mobileFilters: true
  },
  
  // Desktop-first actions
  actions: {
    create: true,
    update: true,
    delete: true,
    duplicate: false,
    bulk: true
  },
  
  // Mobile responsive configuration (secondary to desktop)
  mobile: {
    cardFormat: 'detailed',
    primaryField: 'name',
    secondaryFields: ['email', 'role', 'status'],
    showSearch: true,
    showFilters: true,
    fabPosition: 'bottom-right'
  },
  
  // Desktop table configuration (primary)
  desktop: {
    sortField: 'name',
    sortOrder: 'asc',
    editableField: 'role',
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
export default MEMBER_SCHEMA; 