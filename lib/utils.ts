import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse icon string format "iconName:color" and return components
 * @param iconString - String in format "globe:blue" or just "globe"
 * @returns Object with iconName and color, or null if invalid
 */
export function parseIconString(iconString: string | null | undefined): { iconName: string; color: string } | null {
  if (!iconString || typeof iconString !== 'string') {
    return null;
  }
  
  // Handle "iconName:color" format
  if (iconString.includes(':')) {
    const [iconName, color] = iconString.split(':');
    if (iconName && color) {
      return { iconName: iconName.trim(), color: color.trim() };
    }
  }
  
  // Handle just "iconName" format (default to gray)
  if (iconString.trim()) {
    return { iconName: iconString.trim(), color: '#6B7280' };
  }
  
  return null;
}
