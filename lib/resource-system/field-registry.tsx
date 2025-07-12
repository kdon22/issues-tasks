import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { ColorPicker } from '@/components/ui/color-picker';
import { IconPicker, getIconComponent } from '@/components/ui/icon-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Hash, ExternalLink, Calendar, Check, X } from 'lucide-react';
import { cn, parseIconString } from '@/lib/utils';
import { FieldSchema, ValidationRule } from './schemas';
import { useIsMobile } from '@/components/ui/mobile-responsive';
import { DynamicSelectField } from '@/components/ui/dynamic-select-field';
import { SimpleIcon, SimpleIconWithBackground } from '@/components/ui/simple-icon';

// Mobile-optimized field input components
export interface FieldInputProps {
  field: FieldSchema;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface FieldDisplayProps {
  field: FieldSchema;
  value: any;
  size?: 'sm' | 'md' | 'lg';
  format?: 'full' | 'compact' | 'badge' | 'icon';
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

// TEXT INPUT - Mobile optimized with touch-friendly sizing
export function TextInput({ field, value, onChange, error, disabled, size = 'md' }: FieldInputProps) {
  const isMobile = useIsMobile();
  const mobileSize = isMobile ? 'lg' : size; // Larger touch targets on mobile
  
  return (
    <div className="space-y-1">
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        className={getFieldClassName(value, error, mobileSize)}
        autoComplete="off"
        // Mobile optimizations
        autoCapitalize={field.type === 'text' ? 'words' : 'none'}
        autoCorrect={field.type === 'text' ? 'on' : 'off'}
        inputMode="text"
      />
      {error && <p className="text-sm text-red-500">{isMobile ? (field.validation?.find(v => v.type === 'required')?.mobileMessage || error) : error}</p>}
    </div>
  );
}

export function TextDisplay({ field, value, size = 'md', format = 'full' }: FieldDisplayProps) {
  if (!value) return <span className="text-muted-foreground">-</span>;
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  if (format === 'compact') {
    return <span className={cn(sizeClasses[size], 'truncate')} title={value}>{value}</span>;
  }
  
  return <span className={sizeClasses[size]}>{value}</span>;
}

// TEXTAREA INPUT - Mobile optimized with auto-resize
export function TextareaInput({ field, value, onChange, error, disabled, size = 'md' }: FieldInputProps) {
  const isMobile = useIsMobile();
  const rows = isMobile ? 3 : 2; // More rows on mobile for better UX
  
  return (
    <div className="space-y-1">
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        rows={rows}
        className={getFieldClassName(value, error, size)}
        // Mobile optimizations
        autoCapitalize="sentences"
        autoComplete="off"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// SELECT INPUT - Mobile optimized with larger touch targets (for legacy static options only)
export function SelectInput({ field, value, onChange, error, disabled, size = 'md' }: FieldInputProps) {
  const isMobile = useIsMobile();
  const mobileSize = isMobile ? 'lg' : size;
  
  // Only handle static options - dynamic options should use DynamicSelectField
  const staticOptions = Array.isArray(field.options) ? field.options : [];
  
  return (
    <div className="space-y-1">
      <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={getFieldClassName(value, error, mobileSize)}>
          <SelectValue placeholder={field.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {staticOptions.map(option => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className={isMobile ? 'py-3 px-4' : 'py-2 px-3'} // Larger touch targets
            >
              <div className="flex items-center gap-2">
                {option.icon && <span className="text-base">{option.icon}</span>}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function BadgeDisplay({ field, value, size = 'md', format = 'full' }: FieldDisplayProps) {
  if (!value) return <span className="text-muted-foreground">-</span>;
  
  // Only handle static options - dynamic options should have their own display logic
  const staticOptions = Array.isArray(field.options) ? field.options : [];
  const option = staticOptions.find(opt => opt.value === value);
  const label = option?.label || value;
  
  return (
    <Badge variant="secondary" className={size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm'}>
      {option?.icon && <span className="mr-1">{option.icon}</span>}
      {label}
    </Badge>
  );
}

// MULTI-SELECT INPUT - Mobile optimized (for static options only)
export function MultiSelectInput({ field, value, onChange, error, disabled, size = 'md' }: FieldInputProps) {
  const isMobile = useIsMobile();
  const selectedValues = Array.isArray(value) ? value : [];
  
  // Only handle static options - dynamic options should use a different component
  const staticOptions = Array.isArray(field.options) ? field.options : [];
  
  return (
    <div className="space-y-1">
      <MultiSelect
        options={staticOptions}
        value={selectedValues}
        onValueChange={onChange}
        placeholder={field.placeholder}
        disabled={disabled}
        className={getFieldClassName(value, error, isMobile ? 'lg' : size)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function BadgeListDisplay({ field, value, size = 'md', format = 'full' }: FieldDisplayProps) {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }
  
  const maxDisplay = format === 'compact' ? 2 : 5;
  const displayValues = value.slice(0, maxDisplay);
  const remainingCount = value.length - displayValues.length;
  
  // Only handle static options - dynamic options should have their own display logic
  const staticOptions = Array.isArray(field.options) ? field.options : [];
  
  return (
    <div className="flex flex-wrap gap-1">
      {displayValues.map((val, index) => {
        const option = staticOptions.find(opt => opt.value === val);
        const label = option?.label || val;
        
        return (
          <Badge key={index} variant="secondary" className={size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm'}>
            {option?.icon && <span className="mr-1">{option.icon}</span>}
            {label}
          </Badge>
        );
      })}
      {remainingCount > 0 && (
        <Badge variant="outline" className={size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm'}>
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}

// SWITCH INPUT - Mobile optimized with larger touch area
export function SwitchInput({ field, value, onChange, error, disabled, size = 'md' }: FieldInputProps) {
  const isMobile = useIsMobile();
  const switchSize = isMobile ? 'lg' : size;
  
  return (
    <div className="space-y-1">
      <div className={cn("flex items-center", isMobile ? "py-2" : "py-1")}>
        <Switch
          checked={value || false}
          onCheckedChange={onChange}
          disabled={disabled}
          className={switchSize === 'lg' ? 'scale-110' : ''}
        />
        {isMobile && (
          <span className="ml-3 text-sm text-muted-foreground">
            {field.label}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// NUMBER INPUT - Mobile optimized with numeric keyboard
export function NumberInput({ field, value, onChange, error, disabled, size = 'md' }: FieldInputProps) {
  const isMobile = useIsMobile();
  const mobileSize = isMobile ? 'lg' : size;
  
  return (
    <div className="space-y-1">
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={field.placeholder}
        disabled={disabled}
        className={getFieldClassName(value, error, mobileSize)}
        inputMode="numeric" // Mobile numeric keyboard
        pattern="[0-9]*"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// COLOR INPUT - Mobile optimized with touch-friendly picker
export function ColorInput({ field, value, onChange, error, disabled, size = 'md' }: FieldInputProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-1">
      <ColorPicker
        selectedColor={value || (field.options?.[0]?.value || '#6B7280')}
        onColorSelect={onChange}
        colors={field.options?.map(opt => opt.value)}
        disabled={disabled}
        className={isMobile ? 'w-full' : ''}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function ColorDisplay({ field, value, size = 'md', format = 'full' }: FieldDisplayProps) {
  if (!value) return <span className="text-muted-foreground">-</span>;
  
  const option = field.options?.find(opt => opt.value === value);
  const label = option?.label || value;
  
  if (format === 'icon') {
    return (
      <div
        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
        style={{ backgroundColor: value }}
        title={label}
      />
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-5 h-5 rounded-full border"
        style={{ backgroundColor: value }}
      />
      {format === 'full' && <span className="text-sm">{label}</span>}
    </div>
  );
}

// ICON INPUT - Mobile optimized with touch-friendly picker
export function IconInput({ field, value, onChange, error, disabled, size = 'md' }: FieldInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Ensure we always have a proper value object
  const currentValue = value || {
    type: 'INITIALS',
    color: '#6366F1',
    icon: null,
    emoji: null,
    name: ''
  };

  const renderIconDisplay = () => {
    switch (currentValue.type) {
      case 'INITIALS':
        return (
          <div 
            className={cn(
              "rounded flex items-center justify-center text-white font-semibold",
              isMobile ? "w-10 h-10 text-base" : "w-8 h-8 text-sm"
            )}
            style={{ backgroundColor: currentValue.color }}
          >
            {currentValue.name ? currentValue.name.substring(0, 2).toUpperCase() : 'AB'}
          </div>
        );
      case 'ICON':
        if (currentValue.icon) {
          const IconComponent = getIconComponent(currentValue.icon);
          return (
            <div className={cn(
              "rounded flex items-center justify-center bg-gray-100",
              isMobile ? "w-10 h-10" : "w-8 h-8"
            )}>
              <IconComponent className={cn(
                isMobile ? "w-6 h-6" : "w-4 h-4"
              )} style={{ color: currentValue.color }} />
            </div>
          );
        }
        return (
          <div className={cn(
            "rounded flex items-center justify-center bg-gray-100",
            isMobile ? "w-10 h-10" : "w-8 h-8"
          )}>
            <Hash className={cn(
              isMobile ? "w-6 h-6" : "w-4 h-4"
            )} style={{ color: currentValue.color }} />
          </div>
        );
      case 'EMOJI':
        return (
          <div className={cn(
            "rounded flex items-center justify-center bg-gray-100",
            isMobile ? "w-10 h-10 text-lg" : "w-8 h-8 text-base"
          )}>
            {currentValue.emoji || '🚀'}
          </div>
        );
      default:
        return (
          <div className={cn(
            "rounded flex items-center justify-center bg-gray-100",
            isMobile ? "w-10 h-10" : "w-8 h-8"
          )}>
            <Hash className={cn(
              isMobile ? "w-6 h-6" : "w-4 h-4"
            )} style={{ color: currentValue.color }} />
          </div>
        );
    }
  };

  return (
    <div className="space-y-1">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 border border-gray-200 rounded-md hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
              isMobile ? "p-3" : "p-2"
            )}
            disabled={disabled}
            title="Click to customize"
          >
            {renderIconDisplay()}
            {isMobile && (
              <span className="text-sm text-muted-foreground">Tap to change</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className={cn("p-4", isMobile ? "w-80" : "w-auto")}
          align="start" 
          side={isMobile ? "top" : "bottom"}
          sideOffset={4}
          collisionPadding={8}
          avoidCollisions={true}
        >
          <IconPicker
            selectedIcon={currentValue.icon}
            selectedColor={currentValue.color}
            selectedEmoji={currentValue.emoji}
            selectedAvatarType={currentValue.type}
            teamName={currentValue.name}
            onIconSelect={(icon) => onChange({ ...currentValue, icon, type: 'ICON' })}
            onColorSelect={(color) => onChange({ ...currentValue, color })}
            onEmojiSelect={(emoji) => onChange({ ...currentValue, emoji, type: 'EMOJI' })}
            onAvatarTypeSelect={(type) => onChange({ ...currentValue, type })}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function IconDisplay({ field, value, size = 'md', format = 'full' }: FieldDisplayProps) {
  if (!value) return <span className="text-muted-foreground">-</span>;
  
  const displaySize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
  
  // Handle string format "iconName:color" or just "iconName"
  if (typeof value === 'string') {
    const parsed = parseIconString(value);
    if (parsed) {
      const IconComponent = getIconComponent(parsed.iconName);
      return (
        <div className={cn(displaySize, "rounded flex items-center justify-center bg-gray-100")}>
          <IconComponent className={iconSize} style={{ color: parsed.color }} />
        </div>
      );
    }
    return <span className="text-muted-foreground">-</span>;
  }
  
  // Handle complex object format (legacy)
  if (typeof value === 'object' && value.type) {
    switch (value.type) {
      case 'INITIALS':
        return (
          <div 
            className={cn(displaySize, "rounded flex items-center justify-center text-white font-semibold", textSize)}
            style={{ backgroundColor: value.color }}
          >
            {value.name ? value.name.substring(0, 2).toUpperCase() : 'AB'}
          </div>
        );
      case 'ICON':
        if (value.icon) {
          const IconComponent = getIconComponent(value.icon);
          return (
            <div className={cn(displaySize, "rounded flex items-center justify-center bg-gray-100")}>
              <IconComponent className={iconSize} style={{ color: value.color }} />
            </div>
          );
        }
        return (
          <div className={cn(displaySize, "rounded flex items-center justify-center bg-gray-100")}>
            <Hash className={iconSize} style={{ color: value.color }} />
          </div>
        );
      case 'EMOJI':
        return (
          <div className={cn(displaySize, "rounded flex items-center justify-center bg-gray-100", textSize)}>
            {value.emoji || '🚀'}
          </div>
        );
      default:
        return (
          <div className={cn(displaySize, "rounded flex items-center justify-center bg-gray-100")}>
            <Hash className={iconSize} style={{ color: value.color }} />
          </div>
        );
    }
  }
  
  return <span className="text-muted-foreground">-</span>;
}

// EMAIL INPUT - Mobile optimized with email keyboard
export function EmailInput({ field, value, onChange, error, disabled, size = 'md' }: FieldInputProps) {
  const isMobile = useIsMobile();
  const mobileSize = isMobile ? 'lg' : size;
  
  return (
    <div className="space-y-1">
      <Input
        type="email"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        className={getFieldClassName(value, error, mobileSize)}
        inputMode="email" // Mobile email keyboard
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// URL INPUT - Mobile optimized with URL keyboard
export function UrlInput({ field, value, onChange, error, disabled, size = 'md' }: FieldInputProps) {
  const isMobile = useIsMobile();
  const mobileSize = isMobile ? 'lg' : size;
  
  return (
    <div className="space-y-1">
      <Input
        type="url"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        className={getFieldClassName(value, error, mobileSize)}
        inputMode="url" // Mobile URL keyboard
        autoComplete="url"
        autoCapitalize="none"
        autoCorrect="off"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function LinkDisplay({ field, value, size = 'md', format = 'full' }: FieldDisplayProps) {
  if (!value) return <span className="text-muted-foreground">-</span>;
  
  const displayText = format === 'compact' ? 'Link' : value;
  
  return (
    <a 
      href={value} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 underline"
    >
      {displayText}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

// DATE INPUT - Mobile optimized with date picker
export function DateInput({ field, value, onChange, error, disabled, size = 'md' }: FieldInputProps) {
  const isMobile = useIsMobile();
  const mobileSize = isMobile ? 'lg' : size;
  
  return (
    <div className="space-y-1">
      <Input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        className={getFieldClassName(value, error, mobileSize)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function DateDisplay({ field, value, size = 'md', format = 'full' }: FieldDisplayProps) {
  if (!value) return <span className="text-muted-foreground">-</span>;
  
  const date = new Date(value);
  const displayValue = format === 'compact' 
    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-muted-foreground" />
      <span>{displayValue}</span>
    </div>
  );
}

// AVATAR INPUT - Mobile optimized avatar picker
export function AvatarInput({ field, value, onChange, error, disabled, size = 'md' }: FieldInputProps) {
  return <IconInput field={field} value={value} onChange={onChange} error={error} disabled={disabled} size={size} />;
}

export function AvatarDisplay({ field, value, size = 'md', format = 'full' }: FieldDisplayProps) {
  return <IconDisplay field={field} value={value} size={size} format={format} />;
}

// FIELD REGISTRY - Maps field types to their components
export const FIELD_REGISTRY = {
  text: {
    input: TextInput,
    display: TextDisplay,
  },
  textarea: {
    input: TextareaInput,
    display: TextDisplay,
  },
  select: {
    input: DynamicSelectField,
    display: BadgeDisplay,
  },
  multiSelect: {
    input: MultiSelectInput,
    display: BadgeListDisplay,
  },
  switch: {
    input: SwitchInput,
    display: BadgeDisplay,
  },
  number: {
    input: NumberInput,
    display: TextDisplay,
  },
  color: {
    input: ColorInput,
    display: ColorDisplay,
  },
  icon: {
    input: IconInput,
    display: IconDisplay,
  },
  email: {
    input: EmailInput,
    display: TextDisplay,
  },
  url: {
    input: UrlInput,
    display: LinkDisplay,
  },
  date: {
    input: DateInput,
    display: DateDisplay,
  },
  avatar: {
    input: AvatarInput,
    display: AvatarDisplay,
  },
} as const;

// Helper function to get field components
export function getFieldComponents(fieldType: keyof typeof FIELD_REGISTRY) {
  return FIELD_REGISTRY[fieldType];
}

// Helper function to render field input
export function renderFieldInput(field: FieldSchema, value: any, onChange: (value: any) => void, options?: {
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  resourceHooks?: any;
}) {
  const components = getFieldComponents(field.type);
  const InputComponent = components.input;
  
  // For DynamicSelectField, pass resourceHooks
  if (field.type === 'select' && InputComponent === DynamicSelectField) {
    return (
      <DynamicSelectField
        field={field}
        value={value}
        onChange={onChange}
        resourceHooks={options?.resourceHooks || {}}
        error={options?.error}
        disabled={options?.disabled}
        size={options?.size}
      />
    );
  }
  
  return (
    <InputComponent
      field={field}
      value={value}
      onChange={onChange}
      error={options?.error}
      disabled={options?.disabled}
      size={options?.size}
    />
  );
}

// Helper function to render field display
export function renderFieldDisplay(field: FieldSchema, value: any, options?: {
  size?: 'sm' | 'md' | 'lg';
  format?: 'full' | 'compact' | 'badge' | 'icon';
}) {
  const components = getFieldComponents(field.type);
  const DisplayComponent = components.display;
  
  return (
    <DisplayComponent
      field={field}
      value={value}
      size={options?.size}
      format={options?.format}
    />
  );
} 