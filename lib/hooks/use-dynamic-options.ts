import { useState, useEffect, useMemo } from 'react';
import { FieldSchema } from '@/lib/resource-system/schemas';

export interface DynamicOption {
  value: string;
  label: string;
  icon?: string;
}

export interface UseDynamicOptionsProps {
  field: FieldSchema;
  resourceHooks: any;
}

export function useDynamicOptions({ field, resourceHooks }: UseDynamicOptionsProps) {
  // Check if field has dynamic options configuration
  const isDynamic = useMemo(() => {
    return field.options && 
           typeof field.options === 'object' && 
           !Array.isArray(field.options) &&
           'resource' in field.options;
  }, [field.options]);

  // Static options - return immediately
  const staticOptions = useMemo(() => {
    if (!isDynamic && Array.isArray(field.options)) {
      return field.options.map(opt => ({
        value: opt.value,
        label: opt.label,
        icon: opt.icon
      }));
    }
    return [];
  }, [field.options, isDynamic]);

  // Get dynamic config
  const dynamicConfig = useMemo(() => {
    if (!isDynamic) return null;
    return field.options as {
      resource: string;
      valueField: string;
      labelField: string;
      displayField?: string;
      filter?: (item: any) => boolean;
    };
  }, [field.options, isDynamic]);

  // Get resource hook and data
  const resourceHook = dynamicConfig ? resourceHooks[dynamicConfig.resource] : null;
  const resourceData = resourceHook ? resourceHook.useList() : { data: [], isLoading: false, error: null };

  // Transform dynamic data into options
  const dynamicOptions = useMemo(() => {
    if (!isDynamic || !dynamicConfig || !resourceData.data) {
      return [];
    }

    let filteredData = resourceData.data;
    
    // Apply filter if provided
    if (dynamicConfig.filter) {
      filteredData = resourceData.data.filter(dynamicConfig.filter);
    }
    
    // Map data to options format
    return filteredData.map((item: any) => ({
      value: item[dynamicConfig.valueField],
      label: item[dynamicConfig.labelField],
      icon: item.icon // Use icon from item if available
    }));
  }, [isDynamic, dynamicConfig, resourceData.data]);

  // Final options and state
  const options = isDynamic ? dynamicOptions : staticOptions;
  const loading = isDynamic ? resourceData.isLoading : false;
  const error = isDynamic ? (
    !resourceHook ? `Resource hook not found for: ${dynamicConfig?.resource}` : 
    resourceData.error ? `Failed to load options from ${dynamicConfig?.resource}: ${resourceData.error}` : 
    null
  ) : null;

  return {
    options,
    loading,
    error,
    isDynamic
  };
} 