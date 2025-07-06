"use client";

import { useParams } from 'next/navigation';
import { ResourceSettingsPage } from '@/components/settings/resource-settings-page';
import { useResource } from '@/lib/hooks/use-resource';
import { RoleBadge } from '@/components/ui/role-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { MemberStatusActions } from '@/components/ui/member-status-actions';

export default function MembersSettingsPage() {
  const params = useParams();
  const workspaceUrl = params?.workspaceUrl as string;

  const handleRevokeInvite = async (member: any) => {
    // TODO: Implement revoke invite
    console.log('Revoke invite for:', member);
  };

  const handleSuspend = async (member: any) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceUrl}/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DISABLED' }),
      });
      if (response.ok) {
        // The ResourceSettingsPage will handle the refetch automatically via React Query cache invalidation
        window.location.reload(); // Temporary fallback - ideally we'd use React Query's cache invalidation
      }
    } catch (error) {
      console.error('Failed to suspend member:', error);
    }
  };

  const handleActivate = async (member: any) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceUrl}/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      if (response.ok) {
        // The ResourceSettingsPage will handle the refetch automatically via React Query cache invalidation
        window.location.reload(); // Temporary fallback - ideally we'd use React Query's cache invalidation
      }
    } catch (error) {
      console.error('Failed to activate member:', error);
    }
  };

  const handleResendInvite = async (member: any) => {
    // TODO: Implement resend invite
    console.log('Resend invite for:', member);
  };

  return (
    <ResourceSettingsPage
      config={{
        endpoint: `/api/workspaces/${workspaceUrl}/members`,
        resourceName: 'members',
        title: 'Members',
        description: 'Manage workspace members and their permissions',
        maxWidth: '6xl',
        
        fields: [
          {
            key: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
            placeholder: 'Enter email address'
          },
          {
            key: 'role',
            label: 'Role',
            type: 'select',
            required: true,
            options: [
              { value: 'MEMBER', label: 'Member' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'OWNER', label: 'Owner' }
            ]
          },
          {
            key: 'name',
            label: 'Name',
            type: 'text',
            placeholder: 'Optional display name'
          },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'DISABLED', label: 'Suspended' }
            ]
          }
        ],
        
        searchFields: ['user.email', 'user.name'],
        sortField: 'user.email',
        
        actions: ['create', 'update', 'delete'],
        
        // Use the proper hook pattern
        useResourceHook: () => useResource({
          endpoint: `/api/workspaces/${workspaceUrl}/members`,
          cacheKey: `workspace-${workspaceUrl}-members`
        }),

        // Custom desktop table renderer to handle nested user data and status badges
        desktopTableRenderer: (items, actions) => {
          const { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } = require('@/components/ui/table');
          
          return (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((member: any) => (
                                         <TableRow key={member.id}>
                       <TableCell>{member.user?.email || '-'}</TableCell>
                       <TableCell>
                         <RoleBadge role={member.role} />
                       </TableCell>
                       <TableCell>{member.user?.name || '-'}</TableCell>
                       <TableCell>
                         <StatusBadge status={member.user?.status} />
                       </TableCell>
                       <TableCell className="text-right">
                         <MemberStatusActions
                           member={member}
                           userStatus={member.user?.status}
                           onEdit={actions.onEdit}
                           onDelete={actions.onDelete}
                           onActivate={handleActivate}
                           onSuspend={handleSuspend}
                           onResendInvite={handleResendInvite}
                           onRevokeInvite={handleRevokeInvite}
                         />
                       </TableCell>
                     </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        }
      }}
    />
  );
} 