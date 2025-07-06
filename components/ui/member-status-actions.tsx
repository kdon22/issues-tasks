import { UserCheck, Ban, Mail, UserX, Trash2 } from 'lucide-react';
import { TableActionDropdown } from './table-action-dropdown';

interface MemberStatusActionsProps {
  member: any;
  userStatus: string;
  onEdit: (member: any) => void;
  onDelete: (member: any) => void;
  onActivate: (member: any) => void;
  onSuspend: (member: any) => void;
  onResendInvite: (member: any) => void;
  onRevokeInvite: (member: any) => void;
}

export function MemberStatusActions({
  member,
  userStatus,
  onEdit,
  onDelete,
  onActivate,
  onSuspend,
  onResendInvite,
  onRevokeInvite
}: MemberStatusActionsProps) {
  const getStatusActions = () => {
    const baseActions = [
      {
        label: 'Edit Role',
        onClick: () => onEdit(member)
      }
    ];

    const statusActions = [];
    
    if (userStatus === 'PENDING') {
      statusActions.push(
        {
          label: 'Activate',
          onClick: () => onActivate(member),
          icon: <UserCheck className="h-4 w-4" />
        },
        {
          label: 'Suspend',
          onClick: () => onSuspend(member),
          icon: <Ban className="h-4 w-4" />
        },
        {
          label: 'Resend Invite',
          onClick: () => onResendInvite(member),
          icon: <Mail className="h-4 w-4" />,
          separator: true
        },
        {
          label: 'Revoke Invite',
          onClick: () => onRevokeInvite(member),
          icon: <UserX className="h-4 w-4" />
        }
      );
    } else if (userStatus === 'ACTIVE') {
      statusActions.push({
        label: 'Suspend',
        onClick: () => onSuspend(member),
        icon: <Ban className="h-4 w-4" />
      });
    } else if (userStatus === 'DISABLED') {
      statusActions.push({
        label: 'Activate',
        onClick: () => onActivate(member),
        icon: <UserCheck className="h-4 w-4" />
      });
    } else {
      statusActions.push({
        label: 'Activate',
        onClick: () => onActivate(member),
        icon: <UserCheck className="h-4 w-4" />
      });
    }

    const deleteAction = {
      label: 'Remove',
      onClick: () => onDelete(member),
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const
    };

    return [...baseActions, ...statusActions, deleteAction];
  };

  return <TableActionDropdown actions={getStatusActions()} />;
} 