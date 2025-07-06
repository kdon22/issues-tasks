"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';

interface CreateLabelFormProps {
  onCreateLabel?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

const LABEL_COLORS = [
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

export function CreateLabelForm({ onCreateLabel, onCancel }: CreateLabelFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: LABEL_COLORS[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.color) return;

    setIsSubmitting(true);
    try {
      await onCreateLabel?.(formData);
      setFormData({ name: '', description: '', color: LABEL_COLORS[0] });
    } catch (error) {
      console.error('Failed to create label:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-6 space-y-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: formData.color }}
            />
            <Input
              placeholder="Label name"
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
          
          <div className="flex flex-wrap gap-2">
            {LABEL_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-6 h-6 rounded-full border-2 ${formData.color === color ? 'border-gray-400' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData(prev => ({ ...prev, color }))}
              />
            ))}
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
                Create label
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
} 