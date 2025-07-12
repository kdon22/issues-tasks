"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Check, Loader2 } from 'lucide-react';
import { ResourceSchema, FieldSchema } from '@/lib/resource-system/schemas';
import { renderFieldInput } from '@/lib/resource-system/field-registry';
import { validateField } from '@/lib/resource-system/validation';
import { useIsMobile } from '@/components/ui/mobile-responsive';
import { BaseResource } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ResourceFormProps {
  schema: ResourceSchema;
  mode: 'create' | 'edit';
  initialData?: Partial<BaseResource>;
  onSubmit: (data: Partial<BaseResource>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  className?: string;
  resourceHooks?: any; // Resource hooks for dynamic field options
}

export function ResourceForm({
  schema,
  mode,
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
  resourceHooks
}: ResourceFormProps) {

  const isMobile = useIsMobile();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, any>>(initialData);

  // Create dynamic validation schema from resource schema (memoized)
  const validationSchema = useMemo(() => {
    // Create a simple validation schema that accepts any data
    const schemaFields: Record<string, any> = {};
    
    schema.fields
      .filter(field => field.key !== 'id') // Skip ID field from validation
      .forEach(field => {
        // Simple validation: just accept any value and transform it appropriately
        let fieldSchema: any = z.any().transform((val: any) => {
          // Handle null/undefined
          if (val === null || val === undefined) {
            return field.required ? '' : null;
          }
          
          // Handle objects (like icon picker results)
          if (typeof val === 'object' && val !== null) {
            if (field.type === 'icon') {
              // Preserve the full icon object structure - DON'T convert to string!
              return val;
            }
            return JSON.stringify(val);
          }
          
          // Handle other types
          return val;
        });
        
        // Only add required validation if field is actually required
        if (field.required) {
          fieldSchema = fieldSchema.refine((val: any) => {
            if (val === null || val === undefined || val === '') return false;
            if (typeof val === 'string' && val.trim() === '') return false;
            return true;
          }, `${field.label} is required`);
        }
        
        schemaFields[field.key] = fieldSchema;
      });
    
    return z.object(schemaFields);
  }, [schema.fields]);

  // Clean initial data - remove ID for create mode and transform icon strings to objects
  const cleanInitialData = useMemo(() => {
    let data = initialData;
    
    if (mode === 'create') {
      const { id, ...dataWithoutId } = initialData;
      data = dataWithoutId;
    } else {
      // Edit mode - keep all data
    }
    
    // Transform icon strings to objects for IconInput component
    const transformedData = { ...data };
    
    schema.fields.forEach(field => {
      if (field.type === 'icon' && transformedData[field.key]) {
        const iconValue = transformedData[field.key];
        
        if (typeof iconValue === 'string') {
          // Convert string format to object format
          if (iconValue.includes(':')) {
            const [iconName, color] = iconValue.split(':');
            if (iconName === 'INITIALS') {
              transformedData[field.key] = {
                type: 'INITIALS',
                color: color || '#6366F1',
                icon: null,
                emoji: null,
                name: '' // This will be filled from the form
              };
            } else {
              transformedData[field.key] = {
                type: 'ICON',
                color: color || '#6366F1',
                icon: iconName,
                emoji: null,
                name: ''
              };
            }
          } else {
            // Just icon name, no color
            transformedData[field.key] = {
              type: 'ICON',
              color: '#6366F1',
              icon: iconValue,
              emoji: null,
              name: ''
            };
          }
        }
      }
    });
    
    return transformedData;
  }, [mode, initialData, schema.fields]);

  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: cleanInitialData,
    mode: 'onChange'
  });

  // Check if form is valid using react-hook-form's built-in validation
  const { isValid, errors } = form.formState;
  
  // Debug logging for form state
  const currentFormData = form.getValues();
  
  // Test the validation schema directly
  const manualValidation = validationSchema.safeParse(currentFormData);
  
  // Debug form state (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Form state:', {
      isValid,
      errors,
      formData: currentFormData,
      isSubmitting,
      requiredFields: schema.fields.filter(f => f.required).map(f => f.key),
      manualValidation: manualValidation.success ? 'VALID' : 'INVALID'
    });
  }

  // Reset form when mode or initial data changes
  useEffect(() => {
    form.reset(cleanInitialData);
  }, [form, cleanInitialData]);

  // Update form data when field values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Validate individual fields
  const validateFieldValue = (field: FieldSchema, value: any) => {
    const result = validateField(field, value, formData, isMobile);
    
    if (!result.isValid && result.message) {
      setFieldErrors(prev => ({
        ...prev,
        [field.key]: result.message!
      }));
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field.key];
        return newErrors;
      });
    }
    
    return result.isValid;
  };

  const handleFieldChange = (field: FieldSchema, value: any) => {
    form.setValue(field.key, value);
    validateFieldValue(field, value);
  };

  const handleSubmit = async (data: any) => {
    // Force validation check
    const validationResult = validationSchema.safeParse(data);
    
    if (!validationResult.success) {
      console.error('❌ Form validation failed:', validationResult.error.errors);
      return; // Don't submit if validation fails
    }
    
    try {
      // Transform icon objects to strings for database storage
      const transformedData = { ...validationResult.data };
      
      // Find icon fields and transform them
      schema.fields.forEach(field => {
        if (field.type === 'icon' && transformedData[field.key]) {
          const iconValue = transformedData[field.key];
          
          if (typeof iconValue === 'object' && iconValue !== null) {
            // Convert icon object to string format "iconName:color"
            if (iconValue.type === 'ICON' && iconValue.icon) {
              transformedData[field.key] = `${iconValue.icon}:${iconValue.color || '#6366F1'}`;
            } else if (iconValue.type === 'EMOJI' && iconValue.emoji) {
              transformedData[field.key] = iconValue.emoji;
            } else if (iconValue.type === 'INITIALS') {
              transformedData[field.key] = `INITIALS:${iconValue.color || '#6366F1'}`;
            } else {
              transformedData[field.key] = null;
            }
          }
        }
      });
      
      await onSubmit(transformedData);
    } catch (error) {
      console.error('❌ Form submission error:', error);
      // Don't prevent form from closing on error - let parent handle it
      throw error;
    }
  };

  const getFieldWidth = (field: FieldSchema) => {
    if (isMobile) {
      return 'w-full';
    }
    
    const desktopWidth = field.desktop?.width || 'md';
    const widthMap = {
      'xs': 'w-24',
      'sm': 'w-32',
      'md': 'w-48',
      'lg': 'w-64',
      'xl': 'w-80',
      'auto': 'w-auto'
    };
    
    return widthMap[desktopWidth] || 'w-48';
  };

  return (
    <div className={cn("border rounded-lg p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">
            {mode === 'create' ? `Create ${schema.name.singular}` : `Edit ${schema.name.singular}`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === 'create' 
              ? `Add a new ${schema.name.singular.toLowerCase()} to your workspace`
              : `Update the ${schema.name.singular.toLowerCase()} details`
            }
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Render fields in schema order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schema.fields
            .filter(field => field.key !== 'id') // Skip ID field
            .map((field) => {
              const fieldValue = form.watch(field.key);
              const fieldError = fieldErrors[field.key] || form.formState.errors[field.key]?.message;
              
              return (
                <div key={field.key} className={cn("space-y-2", getFieldWidth(field))}>
                  <Label htmlFor={field.key} className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  
                  {renderFieldInput(field, fieldValue, (value) => handleFieldChange(field, value), {
                    error: fieldError as string,
                    disabled: isSubmitting,
                    size: isMobile ? 'lg' : 'md',
                    resourceHooks: resourceHooks
                  })}
                  
                  {field.placeholder && !fieldError && (
                    <p className="text-xs text-muted-foreground">{field.placeholder}</p>
                  )}
                </div>
              );
            })}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
                        disabled={isSubmitting}
            className="bg-black hover:bg-black/90"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? `Create ${schema.name.singular}` : `Update ${schema.name.singular}`}
          </Button>
        </div>
      </form>
    </div>
  );
} 