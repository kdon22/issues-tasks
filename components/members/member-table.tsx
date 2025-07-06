// Member Management Table - Linear Clone
"use client";

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, TableAction, BulkAction, TableFilter } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserPlus,
  Mail,
  Edit,
  Trash2,
  Shield,
  Crown,
  User,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Member data types
export interface TeamMembership {
  id: string;
  name: string;
  role: 'LEAD' | 'MEMBER' | 'VIEWER';
  permissions: {
    canCreateIssues: boolean;
    canAssignIssues: boolean;
    canManageTeam: boolean;
    canArchiveIssues: boolean;
  };
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  // Workspace-level role
  workspaceRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  // Team-level memberships with individual roles
  teams: TeamMembership[];
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  lastActivity?: Date;
  joinedAt: Date;
  invitedBy?: string;
  inviteExpiry?: Date;
}

interface MemberTableProps {
  members: Member[];
  isLoading?: boolean;
  onInviteMember: (email: string, workspaceRole: string, teams: { teamId: string; role: string }[]) => Promise<void>;
  onUpdateWorkspaceRole: (memberId: string, role: string) => Promise<void>;
  onUpdateTeamRole: (memberId: string, teamId: string, role: string) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onRemoveFromTeam: (memberId: string, teamId: string) => Promise<void>;
  onResendInvitation: (memberId: string) => Promise<void>;
  onBulkRemove: (memberIds: string[]) => Promise<void>;
  availableTeams: { id: string; name: string }[];
}

const workspaceRoleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
  VIEWER: Users,
};

const workspaceRoleColors = {
  OWNER: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  MEMBER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  VIEWER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const teamRoleColors = {
  LEAD: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  MEMBER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  VIEWER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const statusIcons = {
  ACTIVE: CheckCircle,
  PENDING: Clock,
  INACTIVE: XCircle,
};

const statusColors = {
  ACTIVE: 'text-green-600',
  PENDING: 'text-yellow-600',
  INACTIVE: 'text-gray-400',
};

export function MemberTable({
  members,
  isLoading = false,
  onInviteMember,
  onUpdateWorkspaceRole,
  onUpdateTeamRole,
  onRemoveMember,
  onRemoveFromTeam,
  onResendInvitation,
  onBulkRemove,
  availableTeams,
}: MemberTableProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [teamRoleDialogOpen, setTeamRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    workspaceRole: 'MEMBER',
    teams: [] as { teamId: string; role: string }[]
  });

  // Define table columns
  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: 'name',
      header: 'Member',
      cell: ({ row }) => {
        const member = row.original;
        const initials = member.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{member.name}</span>
              <span className="text-xs text-muted-foreground">{member.email}</span>
            </div>
          </div>
        );
      },
      size: 250,
    },
    {
      accessorKey: 'workspaceRole',
      header: 'Workspace Role',
      cell: ({ row }) => {
        const role = row.original.workspaceRole;
        const Icon = workspaceRoleIcons[role];
        return (
          <Badge variant="secondary" className={cn('gap-1.5', workspaceRoleColors[role])}>
            <Icon className="w-3 h-3" />
            {role.charAt(0) + role.slice(1).toLowerCase()}
          </Badge>
        );
      },
      size: 100,
    },
    {
      accessorKey: 'teams',
      header: 'Teams',
      cell: ({ row }) => {
        const teams = row.original.teams;
        if (teams.length === 0) {
          return <span className="text-muted-foreground text-sm">No teams</span>;
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {teams.slice(0, 2).map((team) => (
              <div key={team.id} className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {team.name}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={cn('text-xs', teamRoleColors[team.role])}
                >
                  {team.role}
                </Badge>
              </div>
            ))}
            {teams.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{teams.length - 2} more
              </Badge>
            )}
          </div>
        );
      },
      size: 250,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const Icon = statusIcons[status];
        return (
          <div className="flex items-center gap-2">
            <Icon className={cn('w-4 h-4', statusColors[status])} />
            <span className="text-sm">{status.charAt(0) + status.slice(1).toLowerCase()}</span>
          </div>
        );
      },
      size: 100,
    },
    {
      accessorKey: 'lastActivity',
      header: 'Last Activity',
      cell: ({ row }) => {
        const { lastActivity, status, inviteExpiry } = row.original;
        
        if (status === 'PENDING') {
          return (
            <div className="text-sm text-muted-foreground">
              {inviteExpiry ? (
                <>Expires {formatDistanceToNow(inviteExpiry, { addSuffix: true })}</>
              ) : (
                'Pending invitation'
              )}
            </div>
          );
        }
        
        if (!lastActivity) {
          return <span className="text-muted-foreground text-sm">Never</span>;
        }
        
        return (
          <span className="text-sm">
            {formatDistanceToNow(lastActivity, { addSuffix: true })}
          </span>
        );
      },
      size: 150,
    },
  ];

  // Table actions
  const actions: TableAction<Member>[] = [
    {
      label: 'Edit workspace role',
      icon: Edit,
      onClick: (member) => {
        setSelectedMember(member);
        setRoleDialogOpen(true);
      },
      disabled: (member) => member.workspaceRole === 'OWNER',
    },
    {
      label: 'Manage team roles',
      icon: Users,
      onClick: (member) => {
        setSelectedMember(member);
        setTeamRoleDialogOpen(true);
      },
      hidden: (member) => member.teams.length === 0,
    },
    {
      label: 'Resend invitation',
      icon: Send,
      onClick: (member) => onResendInvitation(member.id),
      hidden: (member) => member.status !== 'PENDING',
    },
    {
      label: 'Remove member',
      icon: Trash2,
      onClick: (member) => onRemoveMember(member.id),
      variant: 'destructive',
      disabled: (member) => member.workspaceRole === 'OWNER',
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Member>[] = [
    {
      label: 'Remove members',
      icon: Trash2,
      onClick: (members) => {
        const memberIds = members
          .filter(m => m.workspaceRole !== 'OWNER')
          .map(m => m.id);
        if (memberIds.length > 0) {
          onBulkRemove(memberIds);
        }
      },
      variant: 'destructive',
      disabled: (members) => members.every(m => m.workspaceRole === 'OWNER'),
    },
  ];

  // Table filters
  const filters: TableFilter[] = [
    {
      id: 'workspaceRole',
      label: 'Workspace Role',
      type: 'select',
      options: [
        { label: 'Owner', value: 'OWNER' },
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Member', value: 'MEMBER' },
        { label: 'Viewer', value: 'VIEWER' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Inactive', value: 'INACTIVE' },
      ],
    },
  ];

  const handleInvite = async () => {
    try {
      await onInviteMember(inviteForm.email, inviteForm.workspaceRole, inviteForm.teams);
      setInviteDialogOpen(false);
      setInviteForm({ email: '', workspaceRole: 'MEMBER', teams: [] });
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const inviteButton = (
    <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
      <UserPlus className="w-4 h-4" />
      Invite member
    </Button>
  );

  return (
    <>
      <DataTable
        data={members}
        columns={columns}
        isLoading={isLoading}
        title="Team Members"
        description="Manage your workspace members and their permissions"
        searchable={true}
        searchPlaceholder="Search members..."
        sortable={true}
        selectable={true}
        pagination={true}
        actions={actions}
        bulkActions={bulkActions}
        filters={filters}
        toolbarActions={inviteButton}
        emptyMessage="No members found. Invite your first team member to get started."
        className="space-y-4"
      />

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invite team member
            </DialogTitle>
            <DialogDescription>
              Invite someone to join your workspace. They'll receive an email with instructions to get started.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workspaceRole">Workspace Role</Label>
              <Select
                value={inviteForm.workspaceRole}
                onValueChange={(value) => setInviteForm(prev => ({ ...prev, workspaceRole: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Teams (optional)</Label>
              <div className="text-sm text-muted-foreground">
                Select teams to add this member to and their role in each team.
              </div>
              {availableTeams.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableTeams.map((team) => {
                    const teamMembership = inviteForm.teams.find(t => t.teamId === team.id);
                    const isSelected = !!teamMembership;
                    
                    return (
                      <div key={team.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setInviteForm(prev => ({
                                  ...prev,
                                  teams: [...prev.teams, { teamId: team.id, role: 'MEMBER' }]
                                }));
                              } else {
                                setInviteForm(prev => ({
                                  ...prev,
                                  teams: prev.teams.filter(t => t.teamId !== team.id)
                                }));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm font-medium">{team.name}</span>
                        </div>
                        
                        {isSelected && (
                          <Select
                            value={teamMembership.role}
                            onValueChange={(value) => {
                              setInviteForm(prev => ({
                                ...prev,
                                teams: prev.teams.map(t => 
                                  t.teamId === team.id ? { ...t, role: value } : t
                                )
                              }));
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LEAD">Lead</SelectItem>
                              <SelectItem value="MEMBER">Member</SelectItem>
                              <SelectItem value="VIEWER">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No teams available. Create a team first to assign members.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteForm.email}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Send invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Edit Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit workspace role for {selectedMember?.name}
            </DialogTitle>
            <DialogDescription>
              Change the workspace role of this member.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspaceRole">Workspace Role</Label>
              <Select
                value={selectedMember?.workspaceRole}
                onValueChange={(value) => {
                  onUpdateWorkspaceRole(selectedMember!.id, value);
                  setRoleDialogOpen(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Role Management Dialog */}
      <Dialog open={teamRoleDialogOpen} onOpenChange={setTeamRoleDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Manage team roles for {selectedMember?.name}
            </DialogTitle>
            <DialogDescription>
              Update this member's role in each team they belong to.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedMember?.teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{team.name}</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Current role:</span>
                      <Badge 
                        variant="secondary" 
                        className={cn('text-xs', teamRoleColors[team.role])}
                      >
                        {team.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={team.role}
                    onValueChange={(value) => {
                      onUpdateTeamRole(selectedMember!.id, team.id, value);
                    }}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEAD">Lead</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFromTeam(selectedMember!.id, team.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setTeamRoleDialogOpen(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 