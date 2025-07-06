// Design System Constants - Linear Clone
export const SIZES = {
  xs: '0.75rem',
  sm: '0.875rem', 
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
} as const;

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

export const PRIORITY_COLORS = {
  NO_PRIORITY: 'bg-muted text-muted-foreground',
  LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  HIGH: 'bg-orange text-orange-foreground',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
} as const;

export const STATE_COLORS = {
  BACKLOG: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  UNSTARTED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  STARTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  CANCELED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
} as const;

export const ANIMATIONS = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const; 