'use client'

import { Popover } from '@headlessui/react'
import { IconPicker } from './IconPicker'
import { type AvatarData } from '@/types/avatar'
import { Avatar } from './Avatar'

interface IconPickerButtonProps {
  data: AvatarData
  onChange: (data: AvatarData) => void
  className?: string
}

export function IconPickerButton({
  data,
  onChange,
  className
}: IconPickerButtonProps) {
  return (
    <Popover className="relative inline-block">
      {({ open }) => (
        <>
          <Popover.Button className={className}>
            <Avatar
              type={data.type}
              name={data.name}
              icon={data.icon}
              color={data.color}
              imageUrl={data.imageUrl}
            />
          </Popover.Button>

          {open && (
            <Popover.Panel static className="absolute left-0 z-50 mt-2">
              <IconPicker
                value={data.icon || ''}
                color={data.color}
                onChange={(icon, color) => {
                  onChange({
                    ...data,
                    type: icon ? 'icon' : 'initials',
                    icon,
                    color
                  })
                }}
              />
            </Popover.Panel>
          )}
        </>
      )}
    </Popover>
  )
} 