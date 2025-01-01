'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid'
import { cn } from '@/lib/utils'

interface DropdownOption {
  label: string
  value: string
}

interface DropdownProps {
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  label?: string
  className?: string
}

export function Dropdown({ value, options, onChange, label, className }: DropdownProps) {
  const selectedOption = options.find(option => option.value === value)

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className={cn(
            "inline-flex items-center justify-between gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
            className
          )}>
            {selectedOption?.label}
            <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 z-10 mt-2 w-max min-w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {options.map((option) => (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={() => onChange(option.value)}
                      className={cn(
                        'flex items-center justify-between px-4 py-2 text-sm w-full',
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      )}
                    >
                      <span>{option.label}</span>
                      {value === option.value && (
                        <CheckIcon className="h-4 w-4 text-orange-500" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
} 