// Utility Formatters - Linear Clone
import { formatDistanceToNow, format } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
};

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatIssueId = (teamId: string, number: number): string => {
  return `${teamId}-${number}`;
};

export const formatInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatPriority = (priority: string): string => {
  return priority.replace('_', ' ').toLowerCase();
};

export const formatStateType = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}; 