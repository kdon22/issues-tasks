"use client";

import { useState, useRef, useEffect } from 'react';
import { Hash, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Default color palette
const DEFAULT_COLORS = [
  '#6B7280', // gray
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#F97316', // orange
  '#14B8A6', // teal
];

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  colors?: string[];
  className?: string;
}

export function ColorPicker({ 
  selectedColor, 
  onColorSelect,
  colors = DEFAULT_COLORS,
  className 
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customColor, setCustomColor] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when shown
  useEffect(() => {
    if (showCustomInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCustomInput]);

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    setIsOpen(false);
    setShowCustomInput(false);
    setCustomColor('');
  };

  const handleCustomColorApply = () => {
    if (customColor.match(/^#[0-9A-F]{6}$/i)) {
      onColorSelect(customColor);
      setIsOpen(false);
      setShowCustomInput(false);
      setCustomColor('');
    }
  };

  const handleCustomColorCancel = () => {
    setShowCustomInput(false);
    setCustomColor('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomColorApply();
    } else if (e.key === 'Escape') {
      handleCustomColorCancel();
    }
  };

  const handleHashClick = () => {
    setShowCustomInput(true);
    setCustomColor(selectedColor);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setShowCustomInput(false);
      setCustomColor('');
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-6 h-6 rounded-full border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
            isOpen
              ? "border-slate-400 shadow-sm"
              : "border-slate-300 hover:border-slate-400",
            className
          )}
          style={{ backgroundColor: selectedColor }}
        />
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-2" 
        align="center" 
        side="bottom" 
        sideOffset={4}
      >
        <div className="flex items-center gap-1">
          {/* Preset Colors */}
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorSelect(color)}
              className={cn(
                "w-5 h-5 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
                selectedColor === color
                  ? "border-slate-400 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          
          {/* Custom Color Section */}
          {!showCustomInput ? (
            /* Hash Button */
            <button
              type="button"
              onClick={handleHashClick}
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
                "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
              )}
              title="Custom color"
            >
              <Hash className="w-2.5 h-2.5 text-slate-600" />
            </button>
          ) : (
            /* Custom Color Input */
            <div className="flex items-center gap-1 ml-1">
              <Input
                ref={inputRef}
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#000000"
                className="w-20 h-6 text-xs font-mono px-2"
                onKeyDown={handleKeyDown}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCustomColorApply}
                disabled={!customColor.match(/^#[0-9A-F]{6}$/i)}
                className="h-6 px-2 text-xs"
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCustomColorCancel}
                className="h-6 px-2 text-xs"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 