export interface UserPreferences {
  id: string
  userId: string
  workspaceId: string
  defaultHomeView: string
  fontSize: string
  interfaceTheme: string
  usePointerCursor: boolean
  displayFullNames: boolean
}

export type UserPreferencesUpdate = Partial<Omit<UserPreferences, 'id' | 'userId'>> & {
  workspaceId: string
} 