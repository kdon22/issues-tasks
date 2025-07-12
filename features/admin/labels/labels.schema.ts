import { ResourceSchema } from '../../../lib/resource-system/schemas';

// Label-specific schema - Single Source of Truth
export const LABEL_SCHEMA: ResourceSchema = {
  // Resource identity
  databaseKey: 'labels',
  endpoint: 'labels',
  actionPrefix: 'label',
  name: {
    singular: 'Label',
    plural: 'Labels'
  },
  
  // Desktop-first display configuration
  display: {
    title: 'Labels',
    description: 'Create labels to categorize and organize your issues',
    icon: 'Tag',
    maxWidth: '5xl'
  },
  
  // Desktop-first field configuration
  fields: [
    {
      key: 'name',
      label: 'Label name',
      type: 'text',
      required: true,
      placeholder: 'e.g. Bug, Feature, Priority',
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
        { type: 'required', message: 'Label name is required', mobileMessage: 'Required' },
        { type: 'minLength', value: 1, message: 'Label name must be at least 1 character', mobileMessage: 'Too short' },
        { type: 'maxLength', value: 50, message: 'Label name must be less than 50 characters', mobileMessage: 'Too long' }
      ]
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Brief description of when to use this label...',
      mobile: {
        priority: 'low',
        displayFormat: 'text',
        condensed: true
      },
      desktop: {
        width: 'lg'
      },
      validation: [
        { type: 'maxLength', value: 500, message: 'Description must be less than 500 characters', mobileMessage: 'Too long' }
      ]
    },
    {
      key: 'color',
      label: 'Color',
      type: 'color',
      required: true,
      mobile: {
        priority: 'high',
        displayFormat: 'icon'
      },
      desktop: {
        width: 'sm',
        sortable: false
      },
      options: [
        { label: 'Red', value: '#EF4444' },
        { label: 'Orange', value: '#F97316' },
        { label: 'Amber', value: '#F59E0B' },
        { label: 'Yellow', value: '#EAB308' },
        { label: 'Lime', value: '#84CC16' },
        { label: 'Green', value: '#22C55E' },
        { label: 'Emerald', value: '#10B981' },
        { label: 'Teal', value: '#14B8A6' },
        { label: 'Cyan', value: '#06B6D4' },
        { label: 'Sky', value: '#0EA5E9' },
        { label: 'Blue', value: '#3B82F6' },
        { label: 'Indigo', value: '#6366F1' },
        { label: 'Violet', value: '#8B5CF6' },
        { label: 'Purple', value: '#A855F7' },
        { label: 'Fuchsia', value: '#D946EF' },
        { label: 'Pink', value: '#EC4899' },
        { label: 'Rose', value: '#F43F5E' },
        { label: 'Gray', value: '#6B7280' }
      ],
      validation: [
        { type: 'required', message: 'Color is required', mobileMessage: 'Required' }
      ]
    },
    {
      key: 'parentId',
      label: 'Parent Group',
      type: 'select',
      required: false,
      placeholder: 'Select parent group (optional)...',
      mobile: {
        priority: 'medium',
        displayFormat: 'text'
      },
      desktop: {
        width: 'md',
        sortable: false,
        filterable: true
      },
      options: [] // Will be populated dynamically from label groups
    },
    {
      key: 'isArchived',
      label: 'Archived',
      type: 'switch',
      required: false,
      mobile: {
        priority: 'low',
        displayFormat: 'badge'
      },
      desktop: {
        width: 'sm'
      }
    }
  ],
  
  // Desktop-first search configuration
  search: {
    fields: ['name', 'description'],
    placeholder: 'Search labels...',
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
    sortField: 'name',
    sortOrder: 'asc',
    editableField: 'name',
    rowActions: true,
    bulkActions: true
  },
  
  // Permissions
  permissions: {
    create: 'workspace.member',
    update: 'workspace.member',
    delete: 'workspace.admin',
    view: 'workspace.member'
  }
};

// Export for use in components
export default LABEL_SCHEMA; 