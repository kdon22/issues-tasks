"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ColorPicker } from '@/components/ui/color-picker';
import { IconPicker } from '@/components/ui/icon-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Check, X, Edit2, Trash2, GripVertical, Plus, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { BaseResource } from '@/lib/types';

export interface SettingsTableColumn {
  key: string;
  label: string;
  width?: string | number;
  render?: (value: any, item: BaseResource) => React.ReactNode;
  editable?: boolean;
  type?: 'text' | 'select' | 'color' | 'icon' | 'badge';
  options?: { value: string; label: string }[];
  clickable?: boolean; // Make column clickable for editing
  // Enhanced responsive properties
  sortable?: boolean;
  filterable?: boolean;
  mobileWidth?: string;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  mobileFormat?: 'badge' | 'text' | 'icon' | 'hidden';
}

interface SettingsTableProps {
  columns: SettingsTableColumn[];
  data: BaseResource[];
  onEdit?: (item: BaseResource, updates?: Partial<BaseResource>) => void;
  onDelete?: (item: BaseResource) => void;
  onCreate?: (data: Partial<BaseResource>) => void;
  draggable?: boolean;
  onReorder?: (items: BaseResource[]) => void;
  emptyMessage?: string;
  createRowConfig?: {
    enabled: boolean;
    defaultValues?: Partial<BaseResource>;
  };
}

export function SettingsTable({
  columns,
  data,
  onEdit,
  onDelete,
  onCreate,
  draggable = false,
  onReorder,
  emptyMessage = "No items found",
  createRowConfig = { enabled: false }
}: SettingsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<BaseResource>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [createData, setCreateData] = useState<Partial<BaseResource>>(createRowConfig.defaultValues || {});

  const handleStartEdit = (item: BaseResource) => {
    // Check if any columns are editable
    const hasEditableColumns = columns.some(column => column.editable);
    
    if (!hasEditableColumns && onEdit) {
      // Use form-based editing - call onEdit with just the item
      onEdit(item);
    } else {
      // Use inline editing
      setEditingId(item.id);
      setEditingData(item);
    }
  };

  const handleSaveEdit = () => {
    if (editingId && onEdit) {
      onEdit({ id: editingId } as BaseResource, editingData);
      setEditingId(null);
      setEditingData({});
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setCreateData(createRowConfig.defaultValues || {});
  };

  const handleSaveCreate = () => {
    if (onCreate) {
      onCreate(createData);
      setIsCreating(false);
      setCreateData(createRowConfig.defaultValues || {});
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setCreateData(createRowConfig.defaultValues || {});
  };

  const renderCell = (column: SettingsTableColumn, item: BaseResource, isEditing: boolean) => {
    const value = (item as any)[column.key];
    
    if (isEditing && column.editable) {
      return renderEditableCell(column, value, (newValue) => {
        setEditingData(prev => ({ ...prev, [column.key]: newValue }));
      });
    }

    const cellContent = () => {
      if (column.render) {
        return column.render(value, item);
      }

      if (column.type === 'badge') {
        return (
          <Badge variant="outline" className="gap-2">
            {typeof value === 'object' ? value?.name || value?.id || 'Unknown' : value}
          </Badge>
        );
      }

      if (column.type === 'color') {
        return (
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: value }}
            />
            <span>{value}</span>
          </div>
        );
      }

      // Handle objects by displaying their name, id, or a string representation
      if (typeof value === 'object' && value !== null) {
        if (value.name) return value.name;
        if (value.id) return value.id;
        return 'Object';
      }

      return value || '-';
    };

    // If column is clickable, wrap in clickable container
    if (column.clickable) {
      return (
        <div 
          className="cursor-pointer hover:text-primary transition-colors"
          onClick={() => handleStartEdit(item)}
          title="Click to edit"
        >
          {cellContent()}
        </div>
      );
    }

    return cellContent();
  };

  const renderEditableCell = (column: SettingsTableColumn, value: any, onChange: (value: any) => void) => {
    switch (column.type) {
      case 'color':
        return (
          <ColorPicker
            selectedColor={value}
            onColorSelect={onChange}
            className="w-6 h-6"
          />
        );
      case 'icon':
        return (
          <IconPicker
            selectedIcon={value}
            onIconSelect={onChange}
            className="w-6 h-6"
          />
        );
      case 'select':
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        );
    }
  };

  const renderCreateCell = (column: SettingsTableColumn) => {
    const value = (createData as any)[column.key];
    return renderEditableCell(column, value, (newValue) => {
      setCreateData(prev => ({ ...prev, [column.key]: newValue }));
    });
  };

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {draggable && <th className="text-left p-2 font-medium text-sm w-8"></th>}
            {columns.map(column => (
              <th 
                key={column.key}
                className="text-left p-2 font-medium text-sm"
                style={column.width ? { width: column.width } : {}}
              >
                {column.label}
              </th>
            ))}
            <th className="text-right p-2 font-medium text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b hover:bg-muted/25">
              {draggable && (
                <td className="p-2">
                  <div className="cursor-grab hover:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </div>
                </td>
              )}
              {columns.map(column => (
                <td key={column.key} className="p-2">
                  {renderCell(column, item, editingId === item.id)}
                </td>
              ))}
              <td className="p-2 text-right">
                <div className="flex items-center gap-2 justify-end">
                  {editingId === item.id ? (
                    <>
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartEdit(item)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(item)} 
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </td>
            </tr>
          ))}
          
          {/* Create row */}
          {createRowConfig.enabled && onCreate && (
            <>
              {isCreating ? (
                <tr className="border-b bg-muted/10">
                  {draggable && <td className="p-2"></td>}
                  {columns.map(column => (
                    <td key={column.key} className="p-2">
                      {renderCreateCell(column)}
                    </td>
                  ))}
                  <td className="p-2 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button size="sm" onClick={handleSaveCreate}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelCreate}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr className="border-b hover:bg-muted/25">
                  {draggable && <td className="p-2"></td>}
                  <td colSpan={columns.length} className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStartCreate}
                      className="w-full justify-start gap-2 h-8"
                    >
                      <Plus className="w-4 h-4" />
                      Add new item
                    </Button>
                  </td>
                  <td className="p-2"></td>
                </tr>
              )}
            </>
          )}
          
          {/* Empty state */}
          {data.length === 0 && !isCreating && (
            <tr>
              <td colSpan={columns.length + (draggable ? 2 : 1)} className="text-center py-8">
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 