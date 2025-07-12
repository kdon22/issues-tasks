import React from 'react';
import { IconCell } from '@/components/ui/icon-cell';
import { BaseResource } from '@/lib/types/resources';

/**
 * Render function for icon table columns
 * Use this in table column definitions to properly display "iconName:color" format icons
 */
export function renderIconColumn(value: any, item: BaseResource) {
  return <IconCell value={value} withBackground={false} size="sm" />;
}

/**
 * Render function for icon table columns with background
 * Use this for more prominent icon display in tables
 */
export function renderIconColumnWithBackground(value: any, item: BaseResource) {
  return <IconCell value={value} withBackground={true} size="sm" />;
}

/**
 * Render function for large icon display
 * Use this for detailed views or larger table cells
 */
export function renderLargeIconColumn(value: any, item: BaseResource) {
  return <IconCell value={value} withBackground={true} size="md" />;
} 