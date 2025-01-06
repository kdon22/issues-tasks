'use client'

import { Fragment, type FC, type ReactNode } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    label: string;
    value: string;
  }>;
  className?: string;
  children?: ReactNode;
}

export const Dropdown: FC<DropdownProps> = ({ value, onChange, options, className, children }) => {
  const selectedOption = options.find(option => option.value === value)

  return (
    <Menu as="div" className="relative inline-block text-left">
      {children ? (
        <Menu.Button className="inline-flex items-center">
          {children}
        </Menu.Button>
      ) : (
        <Menu.Button className={cn(
          "inline-flex items-center justify-between gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
          className
        )}>
          {selectedOption?.label}
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      )}

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-max min-w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => onChange(option.value)}
                    className={cn(
                      'flex items-center px-4 py-2 text-sm w-full min-w-[140px]',
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    )}
                  >
                    <span>{option.label}</span>
                    {value === option.value && (
                      <CheckIcon className="h-5 w-5 text-orange-500 ml-4 flex-shrink-0" />
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 