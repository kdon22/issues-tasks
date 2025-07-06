"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Folder } from 'lucide-react';

interface CreateLabelGroupFormProps {
  onCreateGroup?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export function CreateLabelGroupForm({ onCreateGroup, onCancel }: CreateLabelGroupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6B7280', // Default gray color for groups
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      await onCreateGroup?.(formData);
      setFormData({ name: '', description: '', color: '#6B7280' });
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-6 space-y-3">
          <div className="flex items-center gap-3">
            <Folder className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Group name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="flex-1"
              required
            />
          </div>
          
          <Textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="resize-none"
            rows={2}
          />
          
          <div className="text-sm text-muted-foreground">
            Groups help organize related labels together. You can add labels to this group after creating it.
          </div>
        </div>
        
        <div className="col-span-6 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create group
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
} 