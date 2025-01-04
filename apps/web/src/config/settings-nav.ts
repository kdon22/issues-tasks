import { type SettingsNavigation } from '@/types/navigation'

export const settingsNavigation: SettingsNavigation = {
  sections: [
    {
      label: 'WORKSPACE',
      items: [
        {
          label: 'General',
          href: '/settings/workspace/general',
        },
        {
          label: 'Teams',
          href: '/settings/workspace/teams',
        },
        {
          label: 'Members',
          href: '/settings/workspace/members',
        },
      ],
    },
    {
      label: 'ACCOUNT',
      items: [
        {
          label: 'Profile',
          href: '/settings/account/profile',
        },
        {
          label: 'Preferences',
          href: '/settings/account/preferences',
        },
      ],
    },
  ],
} 