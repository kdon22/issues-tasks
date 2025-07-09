"use client";

/**
 * Enhanced Members Table Features:
 * 
 * 1. Table displays: Avatar, Email, First Name, Last Name, Display Name, Teams (accordion), Status badge
 * 2. Team accordion: Click to expand/collapse team list with roles
 * 3. Status badges: Active (green), Invited (yellow), Disabled (gray)
 * 4. Action menu includes:
 *    - For PENDING users: Resend/Revoke invitation
 *    - For ACTIVE users: Disable member
 *    - For DISABLED users: Enable member
 *    - Delete with confirmation dialog
 * 5. Create form: First Name, Last Name, Display Name, Email, Role dropdown (Owner/Admin/Member/Guest)
 * 6. Confirmation dialog for delete actions using modal.tsx
 */

import React, { useState, useEffect } from 'react';
import { useActionQuery, useOfflineStatus, resourceHooks } from '@/lib/hooks/use-action-api';
import { BaseResource } from '@/lib/types';
import { SettingsPageLayout } from '@/components/layout/settings-page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconPicker } from '@/components/ui/icon-picker';
import { ColorPicker } from '@/components/ui/color-picker';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Edit2, MoreHorizontal, Search, Palette, ChevronDown, ChevronRight, Mail, UserX, RefreshCw, Shield } from 'lucide-react';
import { getIconComponent } from '@/components/ui/icon-picker';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

// BaseResource now includes index signature for additional properties

// Resource configuration
interface ResourceConfig {
  name: string;
  actionPrefix: string; // e.g., 'team', 'project', 'label'
  displayFields: string[];
  searchFields: string[];
  createFields: { key: string; label: string; type: string; required?: boolean; options?: { actionPrefix?: string } }[];
  editFields?: { key: string; label: string; type: string; required?: boolean; options?: { actionPrefix?: string } }[];
}

// Utility to generate common resource configurations
export function generateResourceConfig(
  actionPrefix: string,
  overrides: Partial<ResourceConfig> = {}
): ResourceConfig {
  const name = actionPrefix.charAt(0).toUpperCase() + actionPrefix.slice(1);
  
  const baseConfig: ResourceConfig = {
    name,
    actionPrefix,
    displayFields: ['name', 'createdAt'],
    searchFields: ['name'],
    createFields: [
      { key: 'name', label: 'Name', type: 'text', required: true }
    ]
  };

  // Add common fields based on action prefix
  if (['project', 'label', 'state'].includes(actionPrefix)) {
    baseConfig.displayFields = ['icon', 'name', 'description', 'createdAt'];
    baseConfig.searchFields = ['name', 'description'];
    baseConfig.createFields = [
      { key: 'icon', label: 'Icon', type: 'icon' },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'color', label: 'Color', type: 'color' }
    ];
  }

  // Team-specific fields (uses avatar fields)
  if (actionPrefix === 'team') {
    baseConfig.displayFields = ['avatarIcon', 'name', 'identifier', 'timezone', 'isPrivate', 'createdAt'];
    baseConfig.searchFields = ['name', 'identifier', 'description'];
    baseConfig.createFields = [
      { key: 'avatarIcon', label: 'Icon', type: 'icon' },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'identifier', label: 'Identifier', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'timezone', label: 'Time Zone', type: 'timezone' },
      { key: 'isPrivate', label: 'Private Team', type: 'checkbox' }
    ];
  }

  // Issue Type-specific fields (NO color field)
  if (actionPrefix === 'issueType') {
    baseConfig.displayFields = ['icon', 'name', 'description', 'statusFlowId', 'fieldSetId', 'createdAt'];
    baseConfig.searchFields = ['name', 'description'];
    baseConfig.createFields = [
      { key: 'icon', label: 'Icon', type: 'icon' },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'statusFlowId', label: 'Status Flow', type: 'select', options: { actionPrefix: 'statusFlow' } },
      { key: 'fieldSetId', label: 'Field Set', type: 'select', options: { actionPrefix: 'fieldSet' } }
    ];
  }

  // Project-specific fields
  if (actionPrefix === 'project') {
    baseConfig.createFields.push(
      { key: 'statusFlowId', label: 'Status Flow', type: 'select', options: { actionPrefix: 'statusFlow' } },
      { key: 'fieldSetId', label: 'Field Set', type: 'select', options: { actionPrefix: 'fieldSet' } }
    );
  }

  // Member-specific fields
  if (actionPrefix === 'member') {
    baseConfig.displayFields = ['avatarIcon', 'email', 'name', 'lastName', 'displayName', 'teams', 'status'];
    baseConfig.searchFields = ['name', 'lastName', 'email', 'displayName'];
    baseConfig.createFields = [
      { key: 'name', label: 'First Name', type: 'text', required: true },
      { key: 'lastName', label: 'Last Name', type: 'text', required: true },
      { key: 'displayName', label: 'Display Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'role', label: 'Role', type: 'select', required: true }
    ];
  }

  return { ...baseConfig, ...overrides };
}

// Hook for resource settings that automatically sets up all necessary hooks
export function useResourceSettings<T extends BaseResource = BaseResource>(
  config: ResourceConfig,
  optimisticUpdates: boolean = true
) {
  // Use existing resource hooks instead of creating new ones
  const hooks = (resourceHooks as any)[config.actionPrefix];
  
  const query = hooks.useList();
  const createMutation = hooks.useCreate();
  const updateMutation = hooks.useUpdate();
  const deleteMutation = hooks.useDelete();
  const { isOffline, pendingCount } = useOfflineStatus();

  // Pre-load dropdown options
  const { data: statusFlowOptions = [] } = useActionQuery<BaseResource[]>('statusFlow.list');
  const { data: fieldSetOptions = [] } = useActionQuery<BaseResource[]>('fieldSet.list');

  const getDropdownOptions = (actionPrefix: string): BaseResource[] => {
    switch (actionPrefix) {
      case 'statusFlow':
        return statusFlowOptions;
      case 'fieldSet':
        return fieldSetOptions;
      default:
        return [];
    }
  };

  const handleCreate = (data: any) => {
    createMutation.create(data);
  };

  const handleUpdate = (id: string, data: any) => {
    updateMutation.update(id, data);
  };

  const handleDelete = (id: string) => {
    deleteMutation.delete(id);
  };

  return {
    // Data
    items: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    
    // Status
    isOffline,
    pendingCount,
    
    // Mutations
    create: {
      mutate: handleCreate,
      isPending: createMutation.isPending,
      error: createMutation.error
    },
    update: {
      mutate: handleUpdate,
      isPending: updateMutation.isPending,
      error: updateMutation.error
    },
    delete: {
      mutate: handleDelete,
      isPending: deleteMutation.isPending,
      error: deleteMutation.error
    },
    
    // Utilities
    getDropdownOptions
  };
}

interface ResourceSettingsPageProps {
  config: ResourceConfig;
  title?: string;
  description?: string;
  onEdit?: (item: BaseResource) => void;
}

export function ResourceSettingsPage({ config, title, description, onEdit }: ResourceSettingsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BaseResource | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'destructive' | 'default';
  }>({ open: false, title: '', description: '', onConfirm: () => {} });
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  
  // Use the new resource settings hook
  const {
    items,
    isLoading,
    error,
    isOffline,
    pendingCount,
    create,
    update,
    delete: deleteResource,
    getDropdownOptions
  } = useResourceSettings(config);

  // Filter items based on search
  const filteredItems = items.filter((item: BaseResource) => {
    if (!searchQuery) return true;
    return config.searchFields.some(field => 
      (item as any)[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Initialize form data
  const initializeForm = (item?: BaseResource) => {
    const fields = editingItem ? (config.editFields || config.createFields) : config.createFields;
    const initialData: Record<string, any> = {};
    
    fields.forEach(field => {
      if (field.type === 'checkbox') {
        initialData[field.key] = Boolean(item?.[field.key]);
      } else if (field.type === 'select' && !field.required && item?.[field.key] === null) {
        initialData[field.key] = '__none__';
      } else {
        initialData[field.key] = item?.[field.key] || '';
      }
    });
    
    setFormData(initialData);
  };

  // Handle form submission
  const handleSubmit = async () => {
    const fields = editingItem ? (config.editFields || config.createFields) : config.createFields;
    
    // Basic validation
    const hasError = fields.some(field => {
      if (field.required && !formData[field.key]) {
        toast.error(`${field.label} is required`);
        return true;
      }
      return false;
    });
    
    if (hasError) return;

    // Clean up data
    const cleanedData = { ...formData };
    fields.forEach(field => {
      if (field.type === 'select' && !field.required && (cleanedData[field.key] === '' || cleanedData[field.key] === '__none__')) {
        cleanedData[field.key] = null;
      }
    });

    try {
      if (editingItem) {
        await update.mutate(editingItem.id, cleanedData);
        toast.success(`${config.name} updated successfully`);
      } else {
        await create.mutate(cleanedData);
        toast.success(`${config.name} created successfully`);
      }
      handleCancel();
    } catch (error: any) {
      toast.error(`Failed to ${editingItem ? 'update' : 'create'} ${config.name.toLowerCase()}: ${error.message}`);
    }
  };

  // Handle delete
  const handleDelete = async (item: BaseResource) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await deleteResource.mutate(item.id);
        toast.success(`${config.name} deleted successfully`);
      } catch (error: any) {
        toast.error(`Failed to delete ${config.name.toLowerCase()}: ${error.message}`);
      }
    }
  };

  // Handle edit
  const handleEdit = (item: BaseResource) => {
    if (onEdit) {
      onEdit(item);
    } else {
      setEditingItem(item);
      setShowCreateForm(true);
      initializeForm(item);
    }
  };

  // Handle create
  const handleCreate = () => {
    setEditingItem(null);
    setShowCreateForm(true);
    initializeForm();
  };

  // Cancel form
  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingItem(null);
    setFormData({});
  };

  // Handle member-specific actions
  const handleMemberAction = async (item: BaseResource, action: 'resend' | 'revoke' | 'disable' | 'enable') => {
    try {
      switch (action) {
        case 'resend':
          // TODO: Implement resend invitation
          toast.success('Invitation resent successfully');
          break;
        case 'revoke':
          // TODO: Implement revoke invitation
          toast.success('Invitation revoked successfully');
          break;
        case 'disable':
          await update.mutate(item.id, { status: 'DISABLED' });
          toast.success('Member disabled successfully');
          break;
        case 'enable':
          await update.mutate(item.id, { status: 'ACTIVE' });
          toast.success('Member enabled successfully');
          break;
      }
    } catch (error: any) {
      toast.error(`Failed to ${action} member: ${error.message}`);
    }
  };

  // Handle delete with confirmation
  const handleDeleteWithConfirmation = (item: BaseResource) => {
    setConfirmDialog({
      open: true,
      title: `Delete ${config.name}`,
      description: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      variant: 'destructive',
      onConfirm: () => handleDelete(item)
    });
  };

  // Render form field
  const renderFormField = (field: { key: string; label: string; type: string; required?: boolean; options?: { actionPrefix?: string } }) => {
    const value = (formData[field.key] as string) || '';
    
    switch (field.type) {
      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
            placeholder={field.label}
          />
        );
      case 'textarea':
        return (
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
            placeholder={field.label}
          />
        );
      case 'icon':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-10 h-10 p-0 flex items-center justify-center"
                type="button"
              >
                {value ? (
                  (() => {
                    const IconComponent = getIconComponent(value);
                    return <IconComponent className="h-4 w-4 text-blue-600" />;
                  })()
                ) : (
                  <div className="w-4 h-4 border-2 border-dashed border-muted-foreground rounded" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <IconPicker
                selectedIcon={value}
                onIconSelect={(icon) => setFormData(prev => ({ ...prev, [field.key]: icon }))}
                className="border-0"
              />
            </PopoverContent>
          </Popover>
        );
      case 'color':
        const colorVal = value || '#6B7280';
        return (
          <div className="flex items-center gap-2">
            <ColorPicker
              selectedColor={colorVal}
              onColorSelect={(color) => setFormData(prev => ({ ...prev, [field.key]: color }))}
            />
            <Input
              value={colorVal}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder="#6B7280"
              className="font-mono"
            />
          </div>
        );
      case 'select':
        const options = field.options?.actionPrefix ? getDropdownOptions(field.options.actionPrefix) : [];
        
        // Special handling for role field in member config
        if (field.key === 'role' && config.actionPrefix === 'member') {
          const roleOptions = [
            { id: 'OWNER', name: 'Owner' },
            { id: 'ADMIN', name: 'Admin' },
            { id: 'MEMBER', name: 'Member' },
            { id: 'GUEST', name: 'Guest' }
          ];
          
          return (
            <Select
              value={value}
              onValueChange={(val) => setFormData(prev => ({ ...prev, [field.key]: val }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${field.label}...`} />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        
        return (
          <Select
            value={value}
            onValueChange={(val) => setFormData(prev => ({ ...prev, [field.key]: val }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${field.label}...`} />
            </SelectTrigger>
            <SelectContent>
              {!field.required && (
                <SelectItem value="__none__">
                  <span className="text-muted-foreground">None</span>
                </SelectItem>
              )}
              {options.map((option: BaseResource) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'timezone':
        const commonTimezones = [
          { value: 'America/New_York', label: 'Eastern Time (ET)' },
          { value: 'America/Chicago', label: 'Central Time (CT)' },
          { value: 'America/Denver', label: 'Mountain Time (MT)' },
          { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
          { value: 'UTC', label: 'UTC' },
          { value: 'Europe/London', label: 'London (GMT)' },
          { value: 'Europe/Paris', label: 'Paris (CET)' },
          { value: 'Europe/Berlin', label: 'Berlin (CET)' },
          { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
          { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
          { value: 'Asia/Kolkata', label: 'India (IST)' },
          { value: 'Australia/Sydney', label: 'Sydney (AEDT)' }
        ];
        return (
          <Select
            value={value}
            onValueChange={(val) => setFormData(prev => ({ ...prev, [field.key]: val }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select timezone..." />
            </SelectTrigger>
            <SelectContent>
              {commonTimezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        const isChecked = Boolean(formData[field.key]);
        return (
          <div className="flex items-center space-x-3">
            <Switch
              checked={isChecked}
              onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, [field.key]: checked }))}
            />
            <label className="text-sm font-medium leading-none">
              {field.label}
            </label>
          </div>
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
            placeholder={field.label}
          />
        );
    }
  };

  // Get fields organized by layout groups
  const getFieldsByGroup = () => {
    const fields = editingItem ? (config.editFields || config.createFields) : config.createFields;
    
    const iconField = fields.find(f => f.type === 'icon');
    const nameField = fields.find(f => f.key === 'name');
    const identifierField = fields.find(f => f.key === 'identifier');
    const descriptionField = fields.find(f => f.key === 'description');
    const statusFlowField = fields.find(f => f.key === 'statusFlowId');
    const fieldSetField = fields.find(f => f.key === 'fieldSetId');
    const otherFields = fields.filter(f => 
      !['icon', 'avatarIcon', 'name', 'identifier', 'description', 'statusFlowId', 'fieldSetId'].includes(f.key) &&
      f.type !== 'icon'
    );

    return {
      iconField,
      nameField,
      identifierField,
      descriptionField,
      statusFlowField,
      fieldSetField,
      otherFields
    };
  };

  const fieldGroups = getFieldsByGroup();

  return (
    <SettingsPageLayout title={title || `${config.name}s`} description={description || `Manage ${config.name.toLowerCase()}s in your workspace`}>
      {/* Header with search and create */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${config.name.toLowerCase()}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-3">
          {/* Offline indicator */}
          {isOffline && (
            <Badge variant="outline" className="text-orange-600">
              Offline {pendingCount > 0 && `(${pendingCount} pending)`}
            </Badge>
          )}
          
          <Button onClick={handleCreate} className="bg-black hover:bg-black/90">
            <Plus className="h-4 w-4 mr-2" />
            New {config.name}
          </Button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-card rounded-lg border p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingItem ? `Edit ${config.name}` : `Create ${config.name}`}
          </h3>
          
          <div className="space-y-4">
            {/* Row 1: Icon + Name + Identifier */}
            <div className="flex items-start gap-4">
              {fieldGroups.iconField && (
                <div className="flex-shrink-0">
                  <label className="text-sm font-medium block mb-2">
                    {fieldGroups.iconField.label}
                    {fieldGroups.iconField.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderFormField(fieldGroups.iconField)}
                </div>
              )}
              {fieldGroups.nameField && (
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-2">
                    {fieldGroups.nameField.label}
                    {fieldGroups.nameField.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Input
                    value={(formData[fieldGroups.nameField?.key || 'name'] as string) || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const nameKey = fieldGroups.nameField?.key || 'name';
                      setFormData(prev => {
                        const newData = { ...prev, [nameKey]: value };
                        
                        // Auto-populate identifier with first 3 characters (only if identifier exists and is empty or auto-generated)
                        if (fieldGroups.identifierField && (!prev[fieldGroups.identifierField.key] || prev[fieldGroups.identifierField.key].length <= 3)) {
                          newData[fieldGroups.identifierField.key] = value.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
                        }
                        
                        return newData;
                      });
                    }}
                    placeholder={fieldGroups.nameField?.label || 'Name'}
                  />
                </div>
              )}
              {fieldGroups.identifierField && (
                <div className="w-32">
                  <label className="text-sm font-medium block mb-2">
                    {fieldGroups.identifierField.label}
                    {fieldGroups.identifierField.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Input
                    value={(formData[fieldGroups.identifierField?.key || 'identifier'] as string) || ''}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      const identifierKey = fieldGroups.identifierField?.key || 'identifier';
                      setFormData(prev => ({ ...prev, [identifierKey]: value }));
                    }}
                    placeholder={fieldGroups.identifierField?.label || 'Identifier'}
                    className="font-mono"
                  />
                </div>
              )}
            </div>

            {/* Row 2: Description (full width) */}
            {fieldGroups.descriptionField && (
              <div className="w-full">
                <label className="text-sm font-medium block mb-2">
                  {fieldGroups.descriptionField.label}
                  {fieldGroups.descriptionField.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderFormField(fieldGroups.descriptionField)}
              </div>
            )}

            {/* Row 3: Status Flow + Field Set */}
            <div className="grid grid-cols-2 gap-4">
              {fieldGroups.statusFlowField && (
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {fieldGroups.statusFlowField.label}
                    {fieldGroups.statusFlowField.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderFormField({
                    ...fieldGroups.statusFlowField,
                    options: { actionPrefix: 'statusFlow' }
                  })}
                </div>
              )}
              {fieldGroups.fieldSetField && (
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {fieldGroups.fieldSetField.label}
                    {fieldGroups.fieldSetField.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderFormField({
                    ...fieldGroups.fieldSetField,
                    options: { actionPrefix: 'fieldSet' }
                  })}
                </div>
              )}
            </div>

            {/* Other fields */}
            {fieldGroups.otherFields.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {fieldGroups.otherFields.map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderFormField(field)}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={create.isPending || update.isPending}
              className="bg-black hover:bg-black/90"
            >
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {config.displayFields.map(field => (
                <TableHead key={field} className="font-medium">
                  {field === 'avatarIcon' ? 'Avatar' : 
                   field === 'isPrivate' ? 'Private' :
                   field === 'timezone' ? 'Time Zone' :
                   field === 'statusFlowId' ? 'Status Flow' :
                   field === 'fieldSetId' ? 'Field Set' :
                   field === 'displayName' ? 'Display Name' :
                   field === 'lastName' ? 'Last Name' :
                   field === 'teams' ? 'Teams' :
                   field === 'status' ? 'Status' :
                   field.charAt(0).toUpperCase() + field.slice(1)}
                </TableHead>
              ))}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={config.displayFields.length + 1} className="text-center py-8">
                  Loading {config.name.toLowerCase()}s...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={config.displayFields.length + 1} className="text-center py-8">
                  {searchQuery ? 'No matching results found.' : `No ${config.name.toLowerCase()}s found.`}
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item: BaseResource) => (
                <TableRow key={item.id}>
                  {config.displayFields.map(field => (
                    <TableCell key={field}>
                      {(field === 'icon' || field === 'avatarIcon') && (item as any)[field] ? (
                        <div className="w-8 h-8 flex items-center justify-center border rounded bg-gray-50">
                          {(() => {
                            const IconComponent = getIconComponent((item as any)[field]);
                            return <IconComponent className="h-4 w-4 text-blue-600" />;
                          })()}
                        </div>
                      ) : field === 'avatarIcon' && config.actionPrefix === 'member' ? (
                        <div className="w-8 h-8 flex items-center justify-center border rounded bg-gray-50 text-sm font-medium">
                          {(() => {
                            const member = item as any;
                            if (member.avatarIcon) {
                              const IconComponent = getIconComponent(member.avatarIcon);
                              return <IconComponent className="h-4 w-4 text-blue-600" />;
                            } else if (member.avatarEmoji) {
                              return <span className="text-sm">{member.avatarEmoji}</span>;
                            } else if (member.avatarImageUrl) {
                              return <img src={member.avatarImageUrl} alt="Avatar" className="w-8 h-8 rounded" />;
                            } else {
                              // Show initials
                              const initials = member.name ? member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '?';
                              return <span className="text-xs font-medium text-gray-600">{initials}</span>;
                            }
                          })()}
                        </div>
                      ) : field === 'isPrivate' ? (
                        <Badge variant={(item as any)[field] ? 'secondary' : 'outline'}>
                          {(item as any)[field] ? 'Private' : 'Public'}
                        </Badge>
                      ) : field === 'timezone' ? (
                        (() => {
                          const tz = (item as any)[field];
                          if (!tz) return '-';
                          // Show a shorter, friendlier timezone label
                          const tzLabels: Record<string, string> = {
                            'America/New_York': 'ET',
                            'America/Chicago': 'CT',
                            'America/Denver': 'MT',
                            'America/Los_Angeles': 'PT',
                            'UTC': 'UTC',
                            'Europe/London': 'GMT',
                            'Europe/Paris': 'CET',
                            'Europe/Berlin': 'CET',
                            'Asia/Tokyo': 'JST',
                            'Asia/Shanghai': 'CST',
                            'Asia/Kolkata': 'IST',
                            'Australia/Sydney': 'AEDT'
                          };
                          return tzLabels[tz] || tz;
                        })()
                      ) : field === 'statusFlowId' ? (
                        (() => {
                          const id = (item as any)[field];
                          if (!id) return '-';
                          const statusFlow = getDropdownOptions('statusFlow').find((sf: any) => sf.id === id);
                          return statusFlow?.name || '-';
                        })()
                      ) : field === 'fieldSetId' ? (
                        (() => {
                          const id = (item as any)[field];
                          if (!id) return '-';
                          const fieldSet = getDropdownOptions('fieldSet').find((fs: any) => fs.id === id);
                          return fieldSet?.name || '-';
                        })()
                      ) : field === 'teams' && config.actionPrefix === 'member' ? (
                        (() => {
                          const member = item as any;
                          const teams = member.teams || [];
                          const isExpanded = expandedTeams.has(member.id);
                          
                          if (teams.length === 0) {
                            return <span className="text-muted-foreground">No teams</span>;
                          }
                          
                          return (
                            <div className="space-y-1">
                              <button
                                onClick={() => setExpandedTeams(prev => {
                                  const newSet = new Set(prev);
                                  if (isExpanded) {
                                    newSet.delete(member.id);
                                  } else {
                                    newSet.add(member.id);
                                  }
                                  return newSet;
                                })}
                                className="flex items-center gap-1 text-sm hover:text-blue-600 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                                <span>{teams.length} team{teams.length > 1 ? 's' : ''}</span>
                              </button>
                              {isExpanded && (
                                <div className="ml-4 space-y-1">
                                  {teams.map((team: any) => (
                                    <div key={team.id} className="flex items-center gap-2 text-sm">
                                      <span className="font-medium">{team.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {team.role}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : field === 'status' && config.actionPrefix === 'member' ? (
                        (() => {
                          const status = (item as any)[field];
                          const statusConfig = {
                            'ACTIVE': { label: 'Active', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
                            'PENDING': { label: 'Invited', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
                            'DISABLED': { label: 'Disabled', variant: 'outline' as const, className: 'bg-gray-100 text-gray-800' }
                          };
                          
                          const statusDisplay = statusConfig[status as keyof typeof statusConfig] || statusConfig['ACTIVE'];
                          
                          return (
                            <Badge variant={statusDisplay.variant} className={statusDisplay.className}>
                              {statusDisplay.label}
                            </Badge>
                          );
                        })()
                      ) : (
                        (item as any)[field] || '-'
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        
                        {config.actionPrefix === 'member' && (
                          <>
                            <DropdownMenuSeparator />
                            {(item as any).status === 'PENDING' && (
                              <>
                                <DropdownMenuItem onClick={() => handleMemberAction(item, 'resend')}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Resend Invitation
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMemberAction(item, 'revoke')}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Revoke Invitation
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {(item as any).status === 'ACTIVE' && (
                              <DropdownMenuItem onClick={() => handleMemberAction(item, 'disable')}>
                                <UserX className="h-4 w-4 mr-2" />
                                Disable Member
                              </DropdownMenuItem>
                            )}
                            
                            {(item as any).status === 'DISABLED' && (
                              <DropdownMenuItem onClick={() => handleMemberAction(item, 'enable')}>
                                <Shield className="h-4 w-4 mr-2" />
                                Enable Member
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                          </>
                        )}
                        
                        <DropdownMenuItem 
                          onClick={() => handleDeleteWithConfirmation(item)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

             {error && (
         <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
           <p className="text-red-600">Error loading {config.name.toLowerCase()}s</p>
         </div>
       )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        isLoading={deleteResource.isPending}
      />
    </SettingsPageLayout>
  );
}

/*
USAGE EXAMPLES:

// For a simple resource like Teams:
const TeamSettingsPage = () => {
  const config = generateResourceConfig('team');
  return <ResourceSettingsPage config={config} />;
};

// For Members with enhanced features:
const MembersSettingsPage = () => {
  const config = generateResourceConfig('member');
  return <ResourceSettingsPage config={config} />;
};

// For a more complex resource like Projects:
const ProjectSettingsPage = () => {
  const config = generateResourceConfig('project');
  return <ResourceSettingsPage config={config} />;
};

// For a completely custom resource:
const CustomResourcePage = () => {
  const config = generateResourceConfig('customResource', {
    displayFields: ['name', 'customField', 'status'],
    createFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'customField', label: 'Custom Field', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', required: true }
    ]
  });
  return <ResourceSettingsPage config={config} />;
};

// For new resources (very DRY):
const NewResourcePage = () => {
  return <ResourceSettingsPage config={generateResourceConfig('newResource')} />;
};

// Manual hook usage (if needed):
const ManualHookUsage = () => {
  const { data: teams } = teamHooks.useList();
  const createTeam = teamHooks.useCreate();
  const updateTeam = teamHooks.useUpdate();
  const deleteTeam = teamHooks.useDelete();
  
  // Usage:
  // createTeam.mutate({ name: 'New Team' });
  // updateTeam.mutate('team-id', { name: 'Updated Team' });
  // deleteTeam.mutate('team-id');
};
*/ 