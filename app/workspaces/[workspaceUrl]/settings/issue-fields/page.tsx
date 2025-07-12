// "use client";

// import { ResourceSettingsPage } from '@/components/resource-settings/resource-settings-page';

// // Simple field sets schema since config file was removed
// const FIELD_SET_SCHEMA = {
//   key: 'fieldSet',
//   endpoint: 'field-sets',
//   actionPrefix: 'fieldSet',
//   name: { singular: 'Field Set', plural: 'Field Sets' },
//   display: {
//     title: 'Field Sets',
//     description: 'Manage custom field configurations',
//     icon: 'Settings'
//   },
//   fields: [
//     { key: 'name', label: 'Name', type: 'text' as const, required: true },
//     { key: 'description', label: 'Description', type: 'textarea' as const, required: false }
//   ],
//   search: { fields: ['name'], placeholder: 'Search field sets...' },
//   actions: { create: true, update: true, delete: true },
//   mobile: { cardFormat: 'compact', primaryField: 'name', secondaryFields: ['description'], showSearch: true, showFilters: false, fabPosition: 'bottom-right' },
//   desktop: { sortField: 'name', sortOrder: 'asc', editableField: 'name', rowActions: true, bulkActions: false },
//   permissions: { create: 'workspace.admin', update: 'workspace.admin', delete: 'workspace.admin' }
// };

// export default function IssueFieldsPage() {
//   return <ResourceSettingsPage schema={FIELD_SET_SCHEMA} />;
// } 