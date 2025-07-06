"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { useResource } from '@/lib/hooks/use-resource';
import { useOfflineSync } from '@/lib/hooks/use-offline-sync';
import { 
  MobileHeader, 
  MobileList, 
  MobileFAB, 
  MobileBottomSheet,
  SwipeCard,
  useIsMobile 
} from '@/components/ui/mobile-responsive';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColorPicker } from '@/components/ui/color-picker';
import { IconPicker, getIconComponent } from '@/components/ui/icon-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Check, X, MoreHorizontal, Copy, Hash } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { SettingsPageLayout } from '@/components/layout/settings-page-layout';
import { cn } from '@/lib/utils';

// Field configuration types
interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'number' | 'switch' | 'color' | 'icon';
  options?: string[] | { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
  validation?: (value: any) => string | null;
}

interface ResourceConfig<T = any> {
  // Resource settings
  endpoint: string;
  resourceName: string;
  title: string;
  description: string;
  
  // Form fields
  fields: FieldConfig[];
  
  // Display settings
  searchFields?: string[];
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  
  // Actions
  actions?: ('create' | 'update' | 'delete' | 'duplicate')[];
  
  // Custom actions
  onRowClick?: (item: T) => void;
  editableField?: string; // Field name that should be clickable to edit
  
  // Custom renderers
  mobileCardRenderer?: (item: T, actions: ResourceActions<T>) => ReactNode;
  desktopTableRenderer?: (items: T[], actions: ResourceActions<T>) => ReactNode;
  
  // Hooks
  useResourceHook?: () => any;
  
  // Permissions
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  
  // Mock data for development
  mockData?: T[];
}

interface ResourceActions<T> {
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onDuplicate?: (item: T) => void;
}

interface ResourceSettingsPageProps<T = any> {
  config: ResourceConfig<T>;
  className?: string;
}

export function ResourceSettingsPage<T extends { id: string }>({ 
  config, 
  className 
}: ResourceSettingsPageProps<T>) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  
  // Use custom hook or default useResource
  const resourceHook = config.useResourceHook || (() => useResource({
    endpoint: config.endpoint,
    cacheKey: config.resourceName,
    mockData: config.mockData || []
  }));
  
  const { 
    items, 
    loading, 
    error, 
    create, 
    update, 
    delete: deleteItem, 
    refetch 
  } = resourceHook();
  
  const { isOnline, lastSync } = useOfflineSync();
  
  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Initialize form data
  const initializeFormData = (item?: T): Record<string, any> => {
    const initialData: Record<string, any> = {};
    
    // Check if this is an issue type endpoint to use different field names
    const isIssueType = config.endpoint.includes('issue-types');
    
    config.fields.forEach(field => {
      const value = item ? (item as any)[field.key] : undefined;
      
      // Handle different field types with proper defaults
      switch (field.type) {
        case 'switch':
          initialData[field.key] = value !== undefined ? Boolean(value) : false;
          break;
        case 'number':
          initialData[field.key] = value !== undefined ? Number(value) : 0;
          break;
        case 'color':
          initialData[field.key] = value || (field.options?.[0] ? (typeof field.options[0] === 'string' ? field.options[0] : field.options[0].value) : '#6B7280');
          break;
        case 'icon':
          // Reconstruct icon object from individual database fields
          if (item) {
            if (isIssueType) {
              // For issue types, reconstruct from color and icon fields
              const color = (item as any).color || '#6366F1';
              const icon = (item as any).icon;
              
              initialData[field.key] = {
                type: icon ? (icon.length === 1 ? 'EMOJI' : 'ICON') : 'INITIALS',
                color: color,
                icon: icon && icon.length > 1 ? icon : null,
                emoji: icon && icon.length === 1 ? icon : null,
                name: (item as any).name || ''
              };
            } else {
              // For teams and other resources, use avatar* fields
              initialData[field.key] = {
                type: (item as any).avatarType || 'INITIALS',
                color: (item as any).avatarColor || '#6366F1',
                icon: (item as any).avatarIcon || null,
                emoji: (item as any).avatarEmoji || null,
                name: (item as any).name || ''
              };
            }
          } else {
            initialData[field.key] = {
              type: 'INITIALS',
              color: '#6366F1',
              icon: null,
              emoji: null,
              name: ''
            };
          }
          break;
        default:
          initialData[field.key] = value || '';
      }
    });
    return initialData;
  };

  // Initialize empty form data on mount
  useEffect(() => {
    setFormData(initializeFormData());
  }, [config.fields]);

  // Transform form data to ensure proper types before API submission
  const transformFormData = (data: Record<string, any>): Record<string, any> => {
    const transformed: Record<string, any> = {};
    
    // Check if this is an issue type endpoint to use different field names
    const isIssueType = config.endpoint.includes('issue-types');
    
    config.fields.forEach(field => {
      const value = data[field.key];
      
      switch (field.type) {
        case 'switch':
          transformed[field.key] = Boolean(value);
          break;
        case 'number':
          transformed[field.key] = value !== '' ? Number(value) : null;
          break;
        case 'icon':
          if (value && typeof value === 'object') {
            if (isIssueType) {
              // For issue types, use direct field names
              transformed.color = value.color || '#6366F1';
              if (value.type === 'ICON' && value.icon) {
                transformed.icon = value.icon;
              } else if (value.type === 'EMOJI' && value.emoji) {
                transformed.icon = value.emoji;
              }
            } else {
              // For teams and other resources, use avatar* field names
              transformed.avatarType = value.type || 'INITIALS';
              transformed.avatarColor = value.color || '#6366F1';
              transformed.avatarIcon = value.icon || '';
              transformed.avatarEmoji = value.emoji || '';
            }
          } else {
            if (isIssueType) {
              // Default values for issue types
              transformed.color = '#6366F1';
            } else {
              // Default values for teams
              transformed.avatarType = 'INITIALS';
              transformed.avatarColor = '#6366F1';
              transformed.avatarIcon = '';
              transformed.avatarEmoji = '';
            }
          }
          break;
        default:
          transformed[field.key] = value;
      }
    });
    
    return transformed;
  };
  
  // Filter items based on search
  const filteredItems = items.filter((item: T) => {
    if (!searchQuery) return true;
    
    const searchFields = config.searchFields || ['name', 'title', 'label'];
    return searchFields.some(field => {
      const value = (item as any)[field];
      return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
  });
  
  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!config.sortField) return 0;
    
    const aValue = (a as any)[config.sortField];
    const bValue = (b as any)[config.sortField];
    
    if (config.sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });
  
  // CRUD handlers
  const handleCreate = () => {
    setShowCreateForm(true);
    setFormData(initializeFormData());
  };
  
  const handleEdit = (item: T) => {
    setEditingId(item.id);
    setFormData(initializeFormData(item));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initializeFormData());
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setFormData(initializeFormData());
  };
  
  const handleDelete = async (item: T) => {
    const itemName = (item as any).name || (item as any).title || (item as any).label || 'item';
    if (!confirm(`Delete ${itemName}?`)) return;
    
    try {
      await deleteItem(item.id);
      toast.success(`${config.resourceName} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error(`Failed to delete ${config.resourceName}`);
    }
  };
  
  const handleDuplicate = async (item: T) => {
    try {
      const duplicateData = { ...item };
      delete (duplicateData as any).id;
      
      // Add "Copy" to name if it exists
      if ((duplicateData as any).name) {
        (duplicateData as any).name = `${(duplicateData as any).name} (Copy)`;
      }
      
      await create(duplicateData);
      toast.success(`${config.resourceName} duplicated successfully`);
    } catch (error) {
      console.error('Failed to duplicate:', error);
      toast.error(`Failed to duplicate ${config.resourceName}`);
    }
  };
  
  const handleSubmitCreate = async () => {
    if (!formData || Object.keys(formData).length === 0) return;

    // Validate form
    const validationErrors: string[] = [];
    config.fields.forEach(field => {
      if (field.required && !formData[field.key]) {
        validationErrors.push(`${field.label} is required`);
      }
      if (field.validation) {
        const error = field.validation(formData[field.key]);
        if (error) validationErrors.push(error);
      }
    });
    
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      const transformedData = transformFormData(formData);
      await create(transformedData);
      toast.success(`${config.resourceName} created successfully`);
      handleCancelCreate();
    } catch (error) {
      console.error('Failed to create:', error);
      toast.error(`Failed to create ${config.resourceName}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (id: string) => {
    if (!formData || Object.keys(formData).length === 0) return;

    // Validate form
    const validationErrors: string[] = [];
    config.fields.forEach(field => {
      if (field.required && !formData[field.key]) {
        validationErrors.push(`${field.label} is required`);
      }
      if (field.validation) {
        const error = field.validation(formData[field.key]);
        if (error) validationErrors.push(error);
      }
    });
    
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      const transformedData = transformFormData(formData);
      await update(id, transformedData);
      toast.success(`${config.resourceName} updated successfully`);
      handleCancelEdit();
    } catch (error) {
      console.error('Failed to update:', error);
      toast.error(`Failed to update ${config.resourceName}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Resource actions for renderers
  const resourceActions: ResourceActions<T> = {
    onEdit: handleEdit,
    onDelete: handleDelete,
    onDuplicate: config.actions?.includes('duplicate') ? handleDuplicate : undefined
  };
  
  // Don't render until hydrated
  if (!mounted) {
    return null;
  }
  
  // Loading state - only show full loading if we have no data at all
  if (loading && items.length === 0) {
    return (
      <SettingsPageLayout title={config.title} description={config.description}>
        <div className="flex justify-center py-8">
          <div className="text-muted-foreground">Loading {config.resourceName}...</div>
        </div>
      </SettingsPageLayout>
    );
  }
  
  // Error state
  if (error && items.length === 0) {
    return (
      <SettingsPageLayout title={config.title} description={config.description}>
        <div className="flex justify-center py-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Failed to load {config.resourceName}</p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </SettingsPageLayout>
    );
  }
  
  // Mobile view
  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-screen bg-gray-50", className)}>
        <MobileHeader
          title={config.title}
          subtitle={`${items.length} ${config.resourceName}${items.length === 1 ? '' : 's'}`}
          isOnline={isOnline}
          lastSync={lastSync}
        />

        <div className="flex-1 overflow-hidden">
          <MobileList
            items={sortedItems}
            renderItem={(item) => 
              config.mobileCardRenderer ? 
                config.mobileCardRenderer(item, resourceActions) : 
                <DefaultMobileCard item={item} actions={resourceActions} fields={config.fields} />
            }
            loading={loading}
            error={error}
            emptyMessage={`No ${config.resourceName} found`}
            onRefresh={refetch}
            searchable={true}
            onSearch={setSearchQuery}
          />
        </div>

        {config.actions?.includes('create') && (
          <MobileFAB
            icon={<Plus className="h-5 w-5" />}
            onClick={handleCreate}
            label={`Add ${config.resourceName}`}
          />
        )}
      </div>
    );
  }
  
  // Desktop view
  return (
    <SettingsPageLayout
      title={config.title}
      description={config.description}
      maxWidth={config.maxWidth || 'full'}
      actions={config.actions?.includes('create') ? [
        {
          label: `Add ${config.resourceName}`,
          icon: Plus,
          onClick: handleCreate,
          variant: 'default'
        }
      ] : []}
    >
      <div className="space-y-6">
        {/* Create Form - Hidden above search */}
        {showCreateForm && (
          <div className="border rounded-lg p-4 bg-muted/20">
            <h3 className="font-medium mb-4">Create {config.resourceName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.fields.map(field => (
                              <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium mb-1">{field.label}</label>
                <FieldInput
                  field={field}
                  value={formData[field.key]}
                  onChange={(value) => setFormData(prev => ({ ...prev, [field.key]: value }))}
                />
              </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSubmitCreate} size="sm" disabled={isSubmitting}>
                <Check className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
              <Button variant="outline" onClick={handleCancelCreate} size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder={`Search ${config.resourceName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {!isOnline && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              Offline
            </Badge>
          )}
        </div>

        {/* Content */}
        {config.desktopTableRenderer ? (
          config.desktopTableRenderer(sortedItems, resourceActions)
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  {config.fields.map(field => (
                    <TableHead 
                      key={field.key}
                      className={cn(
                        field.type === 'textarea' && 'w-1/3',
                        field.type === 'text' && field.key === 'name' && 'w-48',
                        field.type === 'select' && 'w-32',
                        field.type === 'color' && 'w-24',
                        field.type === 'switch' && 'w-32',
                        field.type === 'icon' && 'w-32'
                      )}
                    >
                      {field.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-right w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item, index) => (
                  <TableRow 
                    key={`${item.id}-${index}`}
                    className={config.onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                    onClick={() => config.onRowClick?.(item)}
                  >
                    {editingId === item.id ? (
                      <>
                        {config.fields.map(field => (
                          <TableCell key={field.key}>
                            <FieldInput
                              field={field}
                              value={formData[field.key]}
                              onChange={(value) => setFormData(prev => ({ ...prev, [field.key]: value }))}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSubmitEdit(item.id)}
                              disabled={isSubmitting}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        {config.fields.map(field => (
                          <TableCell 
                            key={field.key}
                            className={cn(
                              config.editableField === field.key && config.actions?.includes('update') 
                                ? 'cursor-pointer hover:bg-muted/50' 
                                : ''
                            )}
                            onClick={(e) => {
                              if (config.editableField === field.key && config.actions?.includes('update')) {
                                e.stopPropagation(); // Prevent row click if it exists
                                handleEdit(item);
                              }
                            }}
                          >
                            <FieldDisplay field={field} value={(item as any)[field.key]} />
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          {(config.actions?.includes('delete') || config.actions?.includes('duplicate')) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {config.actions?.includes('duplicate') && (
                                  <DropdownMenuItem onClick={() => handleDuplicate(item)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                )}
                                {config.actions?.includes('delete') && (
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(item)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {sortedItems.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            No {config.resourceName} found. {config.actions?.includes('create') && `Create your first ${config.resourceName} to get started.`}
          </div>
        )}
      </div>
    </SettingsPageLayout>
  );
}

// Icon picker field component with popover
function IconPickerField({ value, onChange }: { value: any; onChange: (value: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  // Ensure we always have a proper value object
  const currentValue = value || {
    type: 'INITIALS',
    color: '#6366F1',
    icon: null,
    emoji: null,
    name: ''
  };

  const renderAvatarDisplay = () => {
    switch (currentValue.type) {
      case 'INITIALS':
        return (
          <div 
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: currentValue.color }}
          >
            {currentValue.name ? currentValue.name.substring(0, 2).toUpperCase() : 'WS'}
          </div>
        );
      case 'ICON':
        if (currentValue.icon) {
          const IconComponent = getIconComponent(currentValue.icon);
          return (
            <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100">
              <IconComponent className="w-4 h-4" style={{ color: currentValue.color }} />
            </div>
          );
        }
        return (
          <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100">
            <Hash className="w-4 h-4" style={{ color: currentValue.color }} />
          </div>
        );
      case 'EMOJI':
        return (
          <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 text-sm">
            {currentValue.emoji || '🚀'}
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100">
            <Hash className="w-4 h-4" style={{ color: currentValue.color }} />
          </div>
        );
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 p-2 border border-gray-200 rounded-md hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          title="Click to customize avatar"
        >
          {renderAvatarDisplay()}
          <span className="text-sm text-muted-foreground">Click to customize</span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-4" 
        align="start" 
        side="bottom" 
        sideOffset={4}
        collisionPadding={8}
        avoidCollisions={true}
      >
        <IconPicker
          selectedIcon={currentValue.icon}
          selectedColor={currentValue.color}
          selectedEmoji={currentValue.emoji}
          selectedAvatarType={currentValue.type}
          teamName={currentValue.name}
          onIconSelect={(icon) => onChange({ ...currentValue, icon, type: 'ICON' })}
          onColorSelect={(color) => onChange({ ...currentValue, color })}
          onEmojiSelect={(emoji) => onChange({ ...currentValue, emoji, type: 'EMOJI' })}
          onAvatarTypeSelect={(type) => onChange({ ...currentValue, type })}
        />
      </PopoverContent>
    </Popover>
  );
}

// Helper function for empty field styling
function getFieldClassName(value: any, baseClassName?: string) {
  return cn(
    'transition-colors',
    (!value || value === '') 
      ? 'bg-slate-50/80 border-slate-200 text-slate-500 placeholder:text-slate-400' 
      : 'bg-white border-input',
    'focus:bg-white focus:border-slate-300 focus:text-slate-900',
    baseClassName
  );
}

// Field input component
function FieldInput({ field, value, onChange }: { 
  field: FieldConfig; 
  value: any; 
  onChange: (value: any) => void; 
}) {
  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={2}
          className={getFieldClassName(value)}
        />
      );
    case 'select':
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className={getFieldClassName(value)}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map(option => (
              <SelectItem 
                key={typeof option === 'string' ? option : option.value} 
                value={typeof option === 'string' ? option : option.value}
              >
                {typeof option === 'string' ? option : option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'switch':
      return (
        <Switch
          checked={value || false}
          onCheckedChange={onChange}
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={field.placeholder}
          className={getFieldClassName(value)}
        />
      );
         case 'color':
       return (
         <ColorPicker
           selectedColor={value || (field.options?.[0] ? (typeof field.options[0] === 'string' ? field.options[0] : field.options[0].value) : '#6B7280')}
           onColorSelect={onChange}
           colors={field.options?.map(color => typeof color === 'string' ? color : color.value)}
         />
       );
    case 'icon':
      return <IconPickerField value={value} onChange={onChange} />;
    default:
      return (
        <Input
          type={field.type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={getFieldClassName(value)}
        />
      );
  }
}

// Field display component
function FieldDisplay({ field, value }: { field: FieldConfig; value: any }) {
  if (!value) return <span className="text-muted-foreground">-</span>;
  
  switch (field.type) {
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full border"
            style={{ backgroundColor: value }}
          />
          <span>{value}</span>
        </div>
      );
    case 'switch':
      return value ? (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Yes</span>
      ) : (
        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">No</span>
      );
    case 'icon':
      if (!value) return <span className="text-muted-foreground">-</span>;
      
      const iconComponent = value.icon && getIconComponent(value.icon);
      
      return (
        <div className="flex items-center gap-2">
          {value.type === 'INITIALS' && (
            <div 
              className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: value.color || '#6366F1' }}
            >
              {value.name ? value.name.substring(0, 2).toUpperCase() : 'WS'}
            </div>
          )}
          {value.type === 'ICON' && iconComponent && (
            <div className="w-5 h-5 rounded flex items-center justify-center bg-gray-100">
              {React.createElement(iconComponent, { 
                className: "w-3 h-3", 
                style: { color: value.color || '#6366F1' } 
              })}
            </div>
          )}
          {value.type === 'EMOJI' && (
            <div className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 text-xs">
              {value.emoji}
            </div>
          )}
          <span className="text-xs text-muted-foreground capitalize">
            {value.type?.toLowerCase() || 'initials'}
          </span>
        </div>
      );
    case 'email':
      return <a href={`mailto:${value}`} className="text-blue-600 hover:underline">{value}</a>;
    default:
      return <span className="font-medium">{value}</span>;
  }
}

// Default mobile card renderer
function DefaultMobileCard<T>({ 
  item, 
  actions, 
  fields 
}: { 
  item: T; 
  actions: ResourceActions<T>; 
  fields: FieldConfig[];
}) {
  const primaryField = fields[0];
  const secondaryField = fields[1];
  
  return (
    <SwipeCard
      leftActions={[
        {
          icon: <Edit2 className="h-4 w-4" />,
          label: 'Edit',
          onClick: () => actions.onEdit(item)
        }
      ]}
      rightActions={[
        ...(actions.onDuplicate ? [{
          icon: <Copy className="h-4 w-4" />,
          label: 'Duplicate',
          onClick: () => actions.onDuplicate!(item)
        }] : []),
        {
          icon: <Trash2 className="h-4 w-4" />,
          label: 'Delete',
          onClick: () => actions.onDelete(item),
          variant: 'destructive' as const
        }
      ]}
    >
      <div className="p-4">
        <div className="font-medium text-slate-900">
          {(item as any)[primaryField.key]}
        </div>
        {secondaryField && (
          <div className="text-sm text-slate-600 mt-1">
            {(item as any)[secondaryField.key]}
          </div>
        )}
      </div>
    </SwipeCard>
  );
} 