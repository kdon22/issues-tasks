import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDynamicOptions } from '@/lib/hooks/use-dynamic-options';
import { FieldSchema } from '@/lib/resource-system/schemas';
import { useIsMobile } from '@/components/ui/mobile-responsive';
import { cn, parseIconString } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { SimpleIcon } from '@/components/ui/simple-icon';

export interface DynamicSelectFieldProps {
  field: FieldSchema;
  value: any;
  onChange: (value: any) => void;
  resourceHooks: any;
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Helper function for mobile-optimized field styling
function getFieldClassName(value: any, error?: string, size: 'sm' | 'md' | 'lg' = 'md') {
  const baseClasses = 'transition-colors border-input';
  const sizeClasses = {
    sm: 'h-8 text-sm px-2',
    md: 'h-10 text-base px-3',
    lg: 'h-12 text-lg px-4'
  };
  const stateClasses = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : (!value || value === '') 
      ? 'bg-slate-50/80 border-slate-200 text-slate-500 placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:text-slate-900' 
      : 'bg-white focus:border-slate-300';
  
  return cn(baseClasses, sizeClasses[size], stateClasses);
}

export function DynamicSelectField({ 
  field, 
  value, 
  onChange, 
  resourceHooks,
  error, 
  disabled, 
  size = 'md' 
}: DynamicSelectFieldProps) {
  const isMobile = useIsMobile();
  const mobileSize = isMobile ? 'lg' : size; // Larger touch targets on mobile
  
  const { options, loading, error: loadError, isDynamic } = useDynamicOptions({ 
    field, 
    resourceHooks 
  });
  
  // Show loading state for dynamic options
  if (loading && isDynamic) {
    return (
      <div className="space-y-1">
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 border border-input rounded-md',
          'bg-slate-50 text-slate-500'
        )}>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading options...</span>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <div className="space-y-1">
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 border border-red-500 rounded-md',
          'bg-red-50 text-red-700'
        )}>
          <span>Error loading options</span>
        </div>
        <p className="text-sm text-red-500">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Select 
        value={value || ''} 
        onValueChange={onChange} 
        disabled={disabled || loading}
      >
        <SelectTrigger className={getFieldClassName(value, error, mobileSize)}>
          <SelectValue placeholder={field.placeholder}>
            {value && (() => {
              const selectedOption = options.find((opt: any) => opt.value === value);
              if (selectedOption) {
                const iconElement = selectedOption.icon && typeof selectedOption.icon === 'string' ? (
                  <SimpleIcon value={selectedOption.icon} size="sm" />
                ) : null;
                
                return (
                  <div className="flex items-center gap-2">
                    {iconElement}
                    {selectedOption.label}
                  </div>
                );
              }
              return null;
            })()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 && (
            <SelectItem value="__no_options__" disabled>
              No options available
            </SelectItem>
          )}
          {options.map((option: any) => {
            // Parse icon if it's a string in "iconName:color" format
            const iconElement = option.icon ? (
              typeof option.icon === 'string' ? (
                <SimpleIcon value={option.icon} size="sm" />
              ) : (
                <span className="text-base">{option.icon}</span>
              )
            ) : null;

            return (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className={isMobile ? 'py-3 px-4' : 'py-2 px-3'} // Larger touch targets
              >
                <div className="flex items-center gap-2">
                  {iconElement}
                  {option.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
} 