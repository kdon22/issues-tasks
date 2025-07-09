"use client";

import React, { useState } from 'react';
import { Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { StateBadge } from '@/components/ui/state-badge';
import { cn } from '@/lib/utils';

interface State {
  id: string;
  name: string;
  color: string;
  type: 'UNSTARTED' | 'STARTED' | 'COMPLETED' | 'CANCELED';
  position: number;
}

interface StatusSelectorProps {
  states: State[];
  selectedState?: State | null;
  onSelect: (state: State) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showBorder?: boolean;
}

export function StatusSelector({ 
  states, 
  selectedState, 
  onSelect, 
  placeholder = "Select status",
  className,
  disabled = false,
  showBorder = false
}: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const renderStateIndicator = (state: State) => {
    return (
      <div className="flex items-center gap-2">
        <Circle 
          className="w-3 h-3 flex-shrink-0" 
          style={{ color: state.color }}
          fill={state.type === 'COMPLETED' ? state.color : 'transparent'}
        />
        <span className="font-medium">{state.name}</span>
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-7 px-2 gap-2 hover:bg-muted text-left justify-start font-normal bg-muted/50",
            showBorder ? "border border-border/20" : "border-0",
            !selectedState && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          {selectedState ? (
            renderStateIndicator(selectedState)
          ) : (
            <>
              <Circle className="w-3 h-3 text-muted-foreground" />
              <span>{placeholder}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
            Status
          </div>
          {states.map((state) => {
            const isSelected = selectedState?.id === state.id;
            
            return (
              <button
                key={state.id}
                onClick={() => {
                  onSelect(state);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left hover:bg-muted transition-colors",
                  isSelected && "bg-accent"
                )}
              >
                <Circle 
                  className="w-3 h-3 flex-shrink-0" 
                  style={{ color: state.color }}
                  fill={state.type === 'COMPLETED' ? state.color : 'transparent'}
                />
                <span className="font-medium">
                  {state.name}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
} 