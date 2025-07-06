"use client";

import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './dropdown-menu';
import { cn } from '@/lib/utils';

interface MultiSelectOption {
  value: string;
  label: string;
  icon?: React.ElementType;
  color?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  maxDisplayed?: number;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select items...",
  maxDisplayed = 2,
  className,
  disabled = false
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedOptions = options.filter(option => 
    selectedValues.includes(option.value)
  );

  const handleSelect = (value: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedValues, value]);
    } else {
      onSelectionChange(selectedValues.filter(v => v !== value));
    }
    // Don't close the dropdown - let user continue selecting
  };

  const handleRemove = (value: string) => {
    onSelectionChange(selectedValues.filter(v => v !== value));
  };

  const displayText = () => {
    if (selectedOptions.length === 0) {
      return placeholder;
    }
    
    if (selectedOptions.length <= maxDisplayed) {
      return selectedOptions.map(option => option.label).join(', ');
    }
    
    const firstItems = selectedOptions.slice(0, maxDisplayed);
    const remaining = selectedOptions.length - maxDisplayed;
    return `${firstItems.map(option => option.label).join(', ')} +${remaining}`;
  };

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex w-full justify-between h-auto min-h-[36px] px-3 py-2 items-center cursor-pointer rounded-md border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
              selectedOptions.length === 0 && "text-muted-foreground",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <div className="flex flex-wrap gap-1 flex-1 text-left">
              {selectedOptions.length === 0 ? (
                <span>{placeholder}</span>
              ) : selectedOptions.length <= maxDisplayed ? (
                selectedOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="text-xs h-5 gap-1 pr-1"
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      <span>{option.label}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(option.value);
                        }}
                        className="ml-1 hover:bg-muted rounded-sm p-0.5"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  );
                })
              ) : (
                <span>{displayText()}</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] p-0">
          <DropdownMenuLabel className="px-3 py-2 text-sm font-medium">
            Select Teams
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-64 overflow-y-auto p-1">
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedValues.includes(option.value);
              return (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleSelect(option.value, checked)}
                  onSelect={(e) => e.preventDefault()} // Prevent closing
                  className="flex items-center gap-2 px-3 py-2"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span className="flex-1">{option.label}</span>
                </DropdownMenuCheckboxItem>
              );
            })}
          </div>
          {selectedOptions.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectionChange([])}
                  className="w-full h-7 text-xs"
                >
                  Clear All
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 