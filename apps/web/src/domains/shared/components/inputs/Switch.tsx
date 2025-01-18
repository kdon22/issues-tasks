'use client'

import * as React from 'react'
import { Switch as HeadlessSwitch } from '@headlessui/react'
import { cn } from '../../utils/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch({ checked, onChange, label, description, disabled }, ref) {
    return (
      <HeadlessSwitch.Group>
        <div className="flex items-start">
          <HeadlessSwitch
            ref={ref}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={cn(
              'relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
              checked ? 'bg-orange-500' : 'bg-gray-200',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                checked ? 'translate-x-5' : 'translate-x-0.5',
                'my-0.5'
              )}
            />
          </HeadlessSwitch>
          {(label || description) && (
            <div className="ml-3">
              {label && (
                <HeadlessSwitch.Label className="text-sm font-medium text-gray-900">
                  {label}
                </HeadlessSwitch.Label>
              )}
              {description && (
                <HeadlessSwitch.Description className="text-sm text-gray-500">
                  {description}
                </HeadlessSwitch.Description>
              )}
            </div>
          )}
        </div>
      </HeadlessSwitch.Group>
    )
  }
)

Switch.displayName = 'Switch' 