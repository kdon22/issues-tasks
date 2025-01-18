export interface SelectOption<T = string> {
  value: T
  label: string
  icon?: React.ComponentType
  description?: string
  disabled?: boolean
} 