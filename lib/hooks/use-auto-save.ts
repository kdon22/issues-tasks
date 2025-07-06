import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoSaveOptions<T> {
  initialValue: T;
  onSave: (value: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn<T> {
  value: T;
  setValue: (value: T) => void;
  isLoading: boolean;
  isSaved: boolean;
  error: string | null;
  hasChanges: boolean;
}

export function useAutoSave<T>({
  initialValue,
  onSave,
  delay = 1000,
  enabled = true
}: UseAutoSaveOptions<T>): UseAutoSaveReturn<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedValueRef = useRef<T>(initialValue);

  const save = useCallback(async (valueToSave: T) => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onSave(valueToSave);
      lastSavedValueRef.current = valueToSave;
      setIsSaved(true);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  }, [onSave, enabled]);

  const debouncedSave = useCallback((valueToSave: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      save(valueToSave);
    }, delay);
  }, [save, delay]);

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
    setHasChanges(true);
    setIsSaved(false);
    setError(null);
    
    // Only auto-save if value has actually changed
    if (JSON.stringify(newValue) !== JSON.stringify(lastSavedValueRef.current)) {
      debouncedSave(newValue);
    }
  }, [debouncedSave]);

  // Update initial value when it changes (e.g., from props)
  useEffect(() => {
    if (JSON.stringify(initialValue) !== JSON.stringify(lastSavedValueRef.current)) {
      setValue(initialValue);
      lastSavedValueRef.current = initialValue;
      setHasChanges(false);
      setIsSaved(true);
    }
  }, [initialValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    value,
    setValue: updateValue,
    isLoading,
    isSaved,
    error,
    hasChanges
  };
}

// Utility hook for simple text auto-save
export function useTextAutoSave(
  initialValue: string,
  onSave: (value: string) => Promise<void>,
  options?: Omit<UseAutoSaveOptions<string>, 'initialValue' | 'onSave'>
) {
  return useAutoSave({
    initialValue,
    onSave,
    ...options
  });
} 