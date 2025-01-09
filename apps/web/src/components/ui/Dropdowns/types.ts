export type DropdownPosition = 'left' | 'right' | 'down'

export interface BaseDropdownProps {
  /** Label shown when no items are selected */
  label: string
  /** Array of options to display in the dropdown */
  options: string[]
  /** Optional CSS class name */
  className?: string
  /** Custom width for the dropdown menu (default: 300px) */
  dropdownWidth?: number
}

export interface SingleSelectProps extends BaseDropdownProps {
  /** Initial selected value */
  defaultValue?: string
  /** Callback fired when selection changes */
  onChange: (value: string) => void
}

export interface MultiSelectProps extends BaseDropdownProps {
  /** Array of pre-selected options */
  defaultValue?: string[]
  /** Callback fired when selection changes */
  onChange: (values: string[]) => void
} 