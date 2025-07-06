import { useRef, useCallback, useState, useEffect } from 'react';

interface UseRichTextAutoSaveOptions {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface UseRichTextAutoSaveReturn {
  isLoading: boolean;
  error: string | null;
  scheduleSave: (value: string) => void;
  saveNow: (value: string) => Promise<void>;
  lastSavedValue: string;
}

export function useRichTextAutoSave({
  initialValue,
  onSave,
  delay = 1000,
  enabled = true
}: UseRichTextAutoSaveOptions): UseRichTextAutoSaveReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setIsLoading(true);
    setError(null);

    try {
      await onSave(value);
      lastSavedValueRef.current = value;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save';
      setError(errorMessage);
      console.error('Auto-save failed:', err);
    } finally {
      setIsLoading(false);
      isSavingRef.current = false;
    }
  }, [onSave, enabled]);

  // Schedule a save operation
  const scheduleSave = useCallback((value: string) => {
    clearSaveTimeout();
    
    if (value === lastSavedValueRef.current) {
      return;
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      performSave(value);
    }, delay);
  }, [delay, performSave, clearSaveTimeout]);

  // Save immediately
  const saveNow = useCallback(async (value: string) => {
    clearSaveTimeout();
    await performSave(value);
  }, [performSave, clearSaveTimeout]);

  // Update last saved value when initial value changes
  useEffect(() => {
    lastSavedValueRef.current = initialValue;
  }, [initialValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSaveTimeout();
    };
  }, [clearSaveTimeout]);

  return {
    isLoading,
    error,
    scheduleSave,
    saveNow,
    lastSavedValue: lastSavedValueRef.current,
  };
} 