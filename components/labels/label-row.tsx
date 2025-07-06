"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2, Check, X } from 'lucide-react';

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

interface LabelRowProps {
  label: Label;
  isChild?: boolean;
  onUpdate?: (id: string, data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const LABEL_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', 
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', 
  '#EC4899', '#F43F5E', '#6B7280', '#374151',
];

export function LabelRow({ label, isChild = false, onUpdate, onDelete }: LabelRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: label.name,
    description: label.description || '',
    color: label.color,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!editData.name) return;

    setIsSubmitting(true);
    try {
      await onUpdate?.(label.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update label:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: label.name,
      description: label.description || '',
      color: label.color,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this label?')) {
      await onDelete?.(label.id);
    }
  };

  if (isEditing) {
    return (
      <div className={`p-4 ${isChild ? 'pl-8' : ''}`}>
        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-6 space-y-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: editData.color }}
              />
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
            
            <div className="flex flex-wrap gap-2">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-5 h-5 rounded-full border-2 ${editData.color === color ? 'border-gray-400' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setEditData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
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
    <div className={`grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 ${isChild ? 'pl-8' : ''}`}>
      <div className="col-span-6 flex items-center gap-3">
        <div 
          className="w-4 h-4 rounded-full flex-shrink-0" 
          style={{ backgroundColor: label.color }}
        />
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
  );
} 