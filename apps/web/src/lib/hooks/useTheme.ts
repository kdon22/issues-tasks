import { useEffect } from 'react'
import { useMediaQuery } from './useMediaQuery'

export function useTheme(theme: string) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'magic-blue', 'classic-dark')
    
    // Add the appropriate theme class
    if (theme === 'system') {
      root.classList.add(prefersDark ? 'dark' : 'light')
    } else {
      root.classList.add(theme)
    }
  }, [theme, prefersDark])
} 