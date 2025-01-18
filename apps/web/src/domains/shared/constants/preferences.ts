export enum HomeView {
  Inbox = 'Inbox',
  MyIssues = 'MyIssues',
  ActiveIssues = 'ActiveIssues',
  AllIssues = 'AllIssues'
}

export enum FontSize {
  Small = 'Small',
  Default = 'Default',
  Large = 'Large'
}

export enum Theme {
  System = 'System',
  Light = 'Light',
  Dark = 'Dark'
}

export interface UserPreferences {
  defaultHomeView: HomeView
  fontSize: FontSize
  interfaceTheme: Theme
  displayFullNames: boolean
  usePointerCursor: boolean
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultHomeView: HomeView.MyIssues,
  fontSize: FontSize.Default,
  interfaceTheme: Theme.System,
  displayFullNames: false,
  usePointerCursor: false
} 