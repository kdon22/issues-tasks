import { LucideIcon } from 'lucide-react';
import type { Workspace } from '@/lib/types/workspace';

export interface NavItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  hasDropdown?: boolean;
  children?: React.ReactNode;
  href?: string;
}

export interface FolderItemProps {
  label: string;
  isNested?: boolean;
  href?: string;
}

export interface TeamSectionProps {
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export interface WorkspaceItem extends Workspace {
  initials: string;
  color: {
    from: string;
    to: string;
  };
}

export interface WorkspaceDropdownProps {
  currentWorkspace: WorkspaceItem;
  workspaces: WorkspaceItem[];
  onClose: () => void;
  onSwitchWorkspace: (url: string) => void;
  onLogout: () => void;
} 