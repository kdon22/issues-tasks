// Keyboard Shortcuts Hook - Linear Clone
"use client";

import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onCommandPalette: () => void;
  onNewIssue: () => void;
}

export function useKeyboardShortcuts({ onCommandPalette, onNewIssue }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette: Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onCommandPalette();
        return;
      }

      // New issue: C (when not in an input field)
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Check if we're in an input field
        const activeElement = document.activeElement;
        const isInputField = activeElement instanceof HTMLInputElement || 
                            activeElement instanceof HTMLTextAreaElement ||
                            activeElement instanceof HTMLSelectElement ||
                            activeElement?.getAttribute('contenteditable') === 'true';
        
        if (!isInputField) {
          e.preventDefault();
          onNewIssue();
          return;
        }
      }

      // Search: S (when not in an input field) - could be useful for focus search
      if (e.key === 's' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const activeElement = document.activeElement;
        const isInputField = activeElement instanceof HTMLInputElement || 
                            activeElement instanceof HTMLTextAreaElement ||
                            activeElement instanceof HTMLSelectElement ||
                            activeElement?.getAttribute('contenteditable') === 'true';
        
        if (!isInputField) {
          e.preventDefault();
          onCommandPalette();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCommandPalette, onNewIssue]);
} 