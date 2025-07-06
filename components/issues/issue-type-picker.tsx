"use client";

import React, { useState } from 'react';
import { FileText, Bug, Zap, Target, AlertTriangle, Settings, CheckCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Issue type icon mapping [[memory:2245441]]
const ISSUE_TYPE_ICONS = {
  bug: Bug,
  feature: Zap,
  task: FileText,
  epic: Target,
  story: FileText,
  improvement: Settings,
  spike: AlertTriangle,
  subtask: CheckCircle,
} as const;

interface IssueType {
  id: string;
  name: string;
  icon?: string | null;
  color: string;
  description?: string | null;
}

interface IssueTypePickerProps {
  issueTypes: IssueType[];
  selectedIssueType?: IssueType | null;
  onSelect: (issueType: IssueType) => void;
  placeholder?: string;
  className?: string;
}

export function IssueTypePicker({ 
  issueTypes, 
  selectedIssueType, 
  onSelect, 
  placeholder = "Select issue type",
  className 
}: IssueTypePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getIconComponent = (iconKey?: string | null) => {
    if (!iconKey) return FileText;
    return ISSUE_TYPE_ICONS[iconKey as keyof typeof ISSUE_TYPE_ICONS] || FileText;
  };

  const selectedIcon = selectedIssueType ? getIconComponent(selectedIssueType.icon) : FileText;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            "justify-between h-9 px-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
            !selectedIssueType && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2">
            {selectedIssueType ? (
              <>
                <div
                  className="w-4 h-4 rounded-sm flex items-center justify-center"
                  style={{ backgroundColor: selectedIssueType.color }}
                >
                  {React.createElement(selectedIcon, { 
                    className: "w-3 h-3 text-white" 
                  })}
                </div>
                <span className="text-sm font-medium">{selectedIssueType.name}</span>
              </>
            ) : (
              <span className="text-sm">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
            Issue Types
          </div>
          {issueTypes.map((issueType) => {
            const IconComponent = getIconComponent(issueType.icon);
            const isSelected = selectedIssueType?.id === issueType.id;
            
            return (
              <button
                key={issueType.id}
                onClick={() => {
                  onSelect(issueType);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                  isSelected && "bg-blue-50 dark:bg-blue-900/20"
                )}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: issueType.color }}
                >
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {issueType.name}
                  </div>
                  {issueType.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {issueType.description}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Compact version for inline use
export function IssueTypeIcon({ issueType, size = 'sm' }: { issueType: IssueType; size?: 'xs' | 'sm' | 'md' }) {
  const IconComponent = issueType.icon ? 
    ISSUE_TYPE_ICONS[issueType.icon as keyof typeof ISSUE_TYPE_ICONS] || FileText : 
    FileText;
  
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4", 
    md: "w-5 h-5"
  };
  
  const containerSizeClasses = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6"
  };

  return (
    <div
      className={cn(
        "rounded-sm flex items-center justify-center flex-shrink-0",
        containerSizeClasses[size]
      )}
      style={{ backgroundColor: issueType.color }}
    >
      <IconComponent className={cn("text-white", sizeClasses[size])} />
    </div>
  );
} 