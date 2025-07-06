"use client";

import { useState, useEffect } from 'react';
import { useEditableAutoSave } from '@/lib/hooks';
import { cn } from '@/lib/utils';

interface IssueTitleProps {
  title: string;
  onTitleChange?: (newTitle: string) => Promise<void>;
  className?: string;
}

export function IssueTitle({ 
  title, 
  onTitleChange, 
  className 
}: IssueTitleProps) {
  const [isEditing, setIsEditing] = useState(false);

  const { elementRef } = useEditableAutoSave<HTMLHeadingElement>({
    initialValue: title,
    onSave: async (newTitle) => {
      if (onTitleChange) {
        await onTitleChange(newTitle);
      }
    },
    delay: 2000 // Auto-save every 2 seconds of inactivity
  });

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      elementRef.current?.blur();
    } else if (e.key === 'Escape') {
      // Reset to original value
      if (elementRef.current) {
        elementRef.current.textContent = title;
      }
      setIsEditing(false);
      elementRef.current?.blur();
    }
  };

  useEffect(() => {
    if (isEditing && elementRef.current) {
      elementRef.current.focus();
      
      // Position cursor at the end of the text
      const range = document.createRange();
      range.selectNodeContents(elementRef.current);
      range.collapse(false); // false = collapse to end (true would be start)
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  return (
    <div className={cn('w-full', className)}>
      <h1 
        ref={elementRef}
        className={cn(
          "text-2xl font-bold outline-none transition-colors",
          isEditing 
            ? "cursor-text bg-gray-50/50 rounded-md px-3 py-2 -mx-3 -my-2 focus:bg-gray-50 focus:ring-1 focus:ring-gray-200" 
            : "cursor-pointer hover:bg-gray-50/30 rounded-md px-3 py-2 -mx-3 -my-2"
        )}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onClick={handleClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        title={isEditing ? undefined : "Click to edit title"}
      >
        {title || 'Untitled Issue'}
      </h1>
    </div>
  );
} 