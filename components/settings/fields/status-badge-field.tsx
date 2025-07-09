import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  'ACTIVE': { label: 'Active', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
  'PENDING': { label: 'Invited', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
  'DISABLED': { label: 'Disabled', variant: 'outline' as const, className: 'bg-gray-100 text-gray-800' }
};

export function StatusBadgeField({ status }: { status: string }) {
  const statusDisplay = statusConfig[status as keyof typeof statusConfig] || statusConfig['ACTIVE'];
  return (
    <Badge variant={statusDisplay.variant} className={statusDisplay.className}>
      {statusDisplay.label}
    </Badge>
  );
} 