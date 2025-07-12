"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';

interface SettingsHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  editable?: boolean;
  onTitleChange?: (title: string, description?: string) => void;
  onAddClick?: () => void;
  addButtonText?: string;
  children?: React.ReactNode;
}

export function SettingsHeader({
  title,
  description,
  showBackButton = false,
  onBack,
  editable = false,
  onTitleChange,
  onAddClick,
  addButtonText = "Add",
  children
}: SettingsHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description || '');

  const handleSave = () => {
    onTitleChange?.(editTitle, editDescription);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditDescription(description || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Header with breadcrumb */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-4 w-px bg-border" />
            </>
          )}
          
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
                className="w-48"
              />
              <Button onClick={handleSave} size="sm">
                <Check className="w-4 h-4" />
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold">{title}</h1>
              {editable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        {children}
      </div>

      {/* Description */}
      {isEditing ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Describe this..."
            className="max-w-md"
          />
        </div>
      ) : (
        description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )
      )}

      {/* Action section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Items</h2>
          <p className="text-sm text-muted-foreground">
            Manage your items
          </p>
        </div>
        {onAddClick && (
          <Button onClick={onAddClick} className="gap-2">
            <Plus className="w-4 h-4" />
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  );
} 