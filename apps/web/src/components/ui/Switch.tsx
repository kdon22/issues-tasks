'use client'

import { Switch as HeadlessSwitch } from '@headlessui/react'
import { cn } from '@/lib/utils'
import { type FC } from 'react'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
}

export const Switch: FC<SwitchProps> = ({ checked, onChange, label, description }) => {
  return (
    <div className="flex items-start">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      <HeadlessSwitch
        checked={checked}
        onChange={onChange}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
          checked ? 'bg-orange-500' : 'bg-gray-200'
        )}
      >
        <span 
          aria-hidden="true"
          className={cn(
            'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </HeadlessSwitch>
    </div>
  )
} 