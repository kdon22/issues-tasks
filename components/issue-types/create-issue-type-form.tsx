"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Bug, Zap, Target, FileText, AlertTriangle, Settings, CheckCircle, Plus, X } from 'lucide-react';

interface IssueType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  isDefault: boolean;
}

interface CreateIssueTypeFormProps {
  issueType?: IssueType;
  onCreateIssueType?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

const ISSUE_TYPE_ICONS = [
  { key: 'bug', icon: Bug, label: 'Bug' },
  { key: 'feature', icon: Zap, label: 'Feature' },
  { key: 'task', icon: FileText, label: 'Task' },
  { key: 'epic', icon: Target, label: 'Epic' },
  { key: 'story', icon: FileText, label: 'Story' },
  { key: 'improvement', icon: Settings, label: 'Improvement' },
  { key: 'spike', icon: AlertTriangle, label: 'Spike' },
  { key: 'subtask', icon: CheckCircle, label: 'Subtask' },
];

const ISSUE_TYPE_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#6B7280', // Gray
  '#374151', // Dark Gray
];

export function CreateIssueTypeForm({ issueType, onCreateIssueType, onCancel }: CreateIssueTypeFormProps) {
  const [formData, setFormData] = useState({
    name: issueType?.name || '',
    description: issueType?.description || '',
    icon: issueType?.icon || 'bug',
    color: issueType?.color || ISSUE_TYPE_COLORS[0],
    isDefault: issueType?.isDefault || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.color) return;

    setIsSubmitting(true);
    try {
      await onCreateIssueType?.(formData);
    } catch (error) {
      console.error('Failed to save issue type:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedIcon = ISSUE_TYPE_ICONS.find(i => i.key === formData.icon) || ISSUE_TYPE_ICONS[0];
  const IconComponent = selectedIcon.icon;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Preview */}
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/20">
        <div 
          className="w-10 h-10 rounded-md flex items-center justify-center" 
          style={{ backgroundColor: formData.color }}
        >
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-medium">{formData.name || 'Issue Type Name'}</div>
          <div className="text-sm text-muted-foreground">
            {formData.description || 'Issue type description'}
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          placeholder="e.g. Bug, Feature, Task"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          placeholder="Describe what this issue type represents..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      {/* Icon Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Icon</label>
        <div className="grid grid-cols-4 gap-3">
          {ISSUE_TYPE_ICONS.map((iconOption) => {
            const Icon = iconOption.icon;
            const isSelected = formData.icon === iconOption.key;
            
            return (
              <button
                key={iconOption.key}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, icon: iconOption.key }))}
                className={`p-3 border rounded-lg flex flex-col items-center gap-2 hover:bg-muted/50 transition-colors ${
                  isSelected ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{iconOption.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Color</label>
        <div className="flex flex-wrap gap-2">
          {ISSUE_TYPE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-gray-400 ring-2 ring-primary ring-offset-2' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData(prev => ({ ...prev, color }))}
            />
          ))}
        </div>
      </div>

      {/* Default */}
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div>
          <div className="text-sm font-medium">Default issue type</div>
          <div className="text-xs text-muted-foreground">
            Make this the default issue type for new issues
          </div>
        </div>
        <Switch
          checked={formData.isDefault}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {issueType ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              {issueType ? 'Update issue type' : 'Create issue type'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 