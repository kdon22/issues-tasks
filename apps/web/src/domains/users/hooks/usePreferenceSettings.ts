'use client'

import { trpc } from '@/infrastructure/trpc/core/client'
import { HomeView, FontSize, Theme } from '@/domains/shared/constants/preferences'

type PreferenceValues = {
  defaultHomeView: "MyIssues" | "ActiveIssues" | "AllIssues"
  fontSize: "Small" | "Default" | "Large"
  interfaceTheme: "System" | "Light" | "Dark"
  displayFullNames: boolean
  usePointerCursor: boolean
}

type PreferencesInput = {
  workspaceId: string
  preferences: {
    preferences: PreferenceValues
    workspaceId: string
  }
}

export function usePreferenceSettings() {
  const utils = trpc.useContext()
  const { data: workspace } = trpc.workspace.getCurrent.useQuery()
  const { data, isLoading } = trpc.user.getPreferences.useQuery()

  const { mutate: updatePreferences } = trpc.user.updatePreferences.useMutation({
    onSuccess: () => {
      utils.user.getPreferences.invalidate()
    }
  })

  const preferences: PreferenceValues = {
    defaultHomeView: (data?.defaultHomeView || HomeView.MyIssues) as PreferenceValues['defaultHomeView'],
    fontSize: (data?.fontSize || FontSize.Default) as PreferenceValues['fontSize'],
    interfaceTheme: (data?.interfaceTheme || Theme.System) as PreferenceValues['interfaceTheme'],
    displayFullNames: data?.displayFullNames ?? false,
    usePointerCursor: data?.usePointerCursor ?? true
  }

  return {
    preferences,
    isLoading,
    updatePreferences: (updates: Partial<PreferenceValues>) => 
      workspace && updatePreferences({
        workspaceId: workspace.id,
        preferences: {
          preferences: { ...preferences, ...updates },
          workspaceId: workspace.id
        }
      })
  }
} 