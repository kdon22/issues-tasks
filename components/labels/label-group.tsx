"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, MoreHorizontal, Edit, Trash2, Check, X, Folder } from 'lucide-react';
import { LabelRow } from './label-row';

interface Label {
  id: string;
  name: string;
  description?: string;
  color: string;
  parentId?: string;
  issueCount: number;
  createdAt: string;
  updatedAt: string;
  children?: Label[];
}

interface LabelGroupProps {
  label: Label;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate?: (id: string, data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onUpdateChild?: (id: string, data: any) => Promise<void>;
  onDeleteChild?: (id: string) => Promise<void>;
}

export function LabelGroup({ 
  label, 
  isExpanded, 
  onToggle, 
  onUpdate, 
  onDelete,
  onUpdateChild,
  onDeleteChild 
}: LabelGroupProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: label.name,
    description: label.description || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!editData.name) return;

    setIsSubmitting(true);
    try {
      await onUpdate?.(label.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: label.name,
      description: label.description || '',
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this group and all its labels?')) {
      await onDelete?.(label.id);
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-muted/20">
        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-6 space-y-3">
            <div className="flex items-center gap-3">
              <Folder className="w-4 h-4 text-gray-500" />
              <Input
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 text-sm"
                required
              />
            </div>
            
            <Textarea
              placeholder="Description (optional)"
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              className="resize-none text-sm"
              rows={2}
            />
          </div>
          
          <div className="col-span-6 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSubmitting}>
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Group Header */}
      <div className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 bg-muted/20">
        <div className="col-span-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
          <Folder className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{label.name}</div>
            {label.description && (
              <div className="text-xs text-muted-foreground truncate">{label.description}</div>
            )}
          </div>
        </div>
        
        <div className="col-span-2 flex items-center justify-center">
          <Badge variant="secondary" className="text-xs">
            {label.issueCount} {label.issueCount === 1 ? 'issue' : 'issues'}
          </Badge>
        </div>
        
        <div className="col-span-2 flex items-center justify-center text-sm text-muted-foreground">
          {label.createdAt}
        </div>
        
        <div className="col-span-2 flex items-center justify-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{label.updatedAt}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Child Labels */}
      {isExpanded && label.children && label.children.length > 0 && (
        <div className="divide-y">
          {label.children.map((child) => (
            <LabelRow
              key={child.id}
              label={child}
              isChild={true}
              onUpdate={onUpdateChild}
              onDelete={onDeleteChild}
            />
          ))}
        </div>
      )}
    </div>
  );
} 