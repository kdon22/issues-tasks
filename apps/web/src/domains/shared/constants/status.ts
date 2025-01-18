export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending'
}

export enum TeamRole {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member'
}

export const ROLE_METADATA = {
  [TeamRole.Owner]: {
    label: 'Owner',
    description: 'Full access to all settings',
    color: 'purple'
  },
  [TeamRole.Admin]: {
    label: 'Admin',
    description: 'Can manage team settings',
    color: 'blue'
  },
  [TeamRole.Member]: {
    label: 'Member',
    description: 'Regular team access',
    color: 'gray'
  }
} as const 