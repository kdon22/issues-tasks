"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IconPicker } from '@/components/ui/icon-picker';
import { getIconComponent } from '@/components/ui/icon-picker';

interface IconFieldProps {
  value?: string; // Format: "iconName:hexColor" or just "iconName"
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export function IconField({ value = '', onChange, readOnly = false }: IconFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse the combined value with default icon
  const parseValue = (val: string) => {
    if (!val) return { icon: 'Building', color: '#6B7280' }; // Default icon
    
    const parts = val.split(':');
    if (parts.length === 2) {
      return { icon: parts[0], color: parts[1] };
    }
    return { icon: val, color: '#6B7280' };
  };
  
  const { icon, color } = parseValue(value);
  
  // Handle icon selection
  const handleIconSelect = (selectedIcon: string) => {
    const combinedValue = `${selectedIcon}:${color}`;
    onChange?.(combinedValue);
    // Don't close the popover - let user click away to dismiss
  };

  // Handle color selection
  const handleColorSelect = (selectedColor: string) => {
    const combinedValue = `${icon}:${selectedColor}`;
    onChange?.(combinedValue);
  };

  const IconComponent = getIconComponent(icon);

  // If read-only, just display the icon with color
  if (readOnly) {
    return (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <IconComponent className="h-4 w-4" style={{ color }} />
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-12 h-8 p-0 flex items-center justify-center"
          type="button"
        >
          <IconComponent className="h-4 w-4" style={{ color }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="start">
        <div className="space-y-3">
          <h4 className="font-medium">Select Icon & Color</h4>
          
          <IconPicker
            selectedIcon={icon}
            selectedColor={color}
            selectedAvatarType="ICON"
            onIconSelect={handleIconSelect}
            onColorSelect={handleColorSelect}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
} 