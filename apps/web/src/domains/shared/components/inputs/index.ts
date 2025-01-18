'use client'

// Components
export { Button } from './Button'
export { Checkbox } from './Checkbox'
export { Input } from './Input'
export { SearchFilter } from './SearchFilter'
export { Select } from './Select'
export { Switch } from './Switch'
export { TextArea } from './TextArea'

// Hooks
export { useSwitch } from '../../hooks/useSwitch'

// Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'compact' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

export interface CheckboxProps {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean
  label?: string
  helperText?: string
}

export interface SearchFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export interface SelectProps<T = string> {
  value: T | T[]
  onChange: (value: T | T[]) => void
  options: Array<{
    value: T
    label: string
    icon?: React.ComponentType
    description?: string
    disabled?: boolean
  }>
  multiple?: boolean
  searchable?: boolean
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showArrow?: boolean
  trigger?: React.ReactNode
}

export interface SwitchProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
  className?: string
  loading?: boolean
}

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
} 