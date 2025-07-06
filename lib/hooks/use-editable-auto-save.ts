import { useRef, useCallback, useEffect } from 'react';

interface UseEditableAutoSaveOptions {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useEditableAutoSave<T extends HTMLElement = HTMLElement>({
  initialValue,
  onSave,
  delay = 2000,
  enabled = true
}: UseEditableAutoSaveOptions) {
  const elementRef = useRef<T>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedValueRef = useRef<string>(initialValue);
  const isSavingRef = useRef(false);

  // Clear any pending save timeout
  const clearSaveTimeout = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  // Perform the actual save
  const performSave = useCallback(async (value: string) => {
    if (!enabled || isSavingRef.current || value === lastSavedValueRef.current) {
      return;
    }

    isSavingRef.current = true;
    try {
      await onSave(value);
      lastSavedValueRef.current = value;
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, enabled]);

  // Schedule a save operation
  const scheduleSave = useCallback((value: string) => {
    clearSaveTimeout();
    saveTimeoutRef.current = setTimeout(() => {
      performSave(value);
    }, delay);
  }, [delay, performSave, clearSaveTimeout]);

  // Handle input events from contentEditable
  const handleInput = useCallback((e: Event) => {
    const target = e.target as T;
    const currentValue = target.textContent || '';
    
    // Schedule auto-save without triggering re-renders
    scheduleSave(currentValue);
  }, [scheduleSave]);

  // Handle blur events (immediate save)
  const handleBlur = useCallback(() => {
    if (elementRef.current) {
      const currentValue = elementRef.current.textContent || '';
      clearSaveTimeout();
      performSave(currentValue);
    }
  }, [performSave, clearSaveTimeout]);

  // Handle key events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      if (elementRef.current) {
        const currentValue = elementRef.current.textContent || '';
        clearSaveTimeout();
        performSave(currentValue);
      }
    }
  }, [performSave, clearSaveTimeout]);

  // Setup event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('input', handleInput);
    element.addEventListener('blur', handleBlur);
    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('input', handleInput);
      element.removeEventListener('blur', handleBlur);
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleInput, handleBlur, handleKeyDown]);

  // Update element content when initial value changes
  useEffect(() => {
    if (elementRef.current && elementRef.current.textContent !== initialValue) {
      elementRef.current.textContent = initialValue;
      lastSavedValueRef.current = initialValue;
    }
  }, [initialValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSaveTimeout();
    };
  }, [clearSaveTimeout]);

  return {
    elementRef,
    // Utility functions if needed
    saveNow: () => {
      if (elementRef.current) {
        const currentValue = elementRef.current.textContent || '';
        clearSaveTimeout();
        performSave(currentValue);
      }
    },
    getCurrentValue: () => elementRef.current?.textContent || '',
    setValue: (value: string) => {
      if (elementRef.current) {
        elementRef.current.textContent = value;
      }
    }
  };
} 