export const settingsNavigation = {
  sections: [
    {
      label: 'WORKSPACE',
      items: [
        { label: 'General', href: '/settings/workspace/general' },
        { label: 'Teams', href: '/settings/workspace/teams' },
        { label: 'Members', href: '/settings/workspace/members' }
      ]
    },
    {
      label: 'ACCOUNT',
      items: [
        { label: 'Profile', href: '/settings/account' },
        { label: 'Preferences', href: '/settings/preferences' }
      ]
    }
  ]
} as const 