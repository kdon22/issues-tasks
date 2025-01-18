'use client'

import { Popover } from '@headlessui/react'
import { Avatar } from './Avatar'
import { AvatarEditor } from './AvatarEditor'
import type { AvatarData } from '../../hooks/useAvatar'

interface Props {
  data: AvatarData
  onChange: (data: AvatarData) => void
}

export function AvatarPicker({ data, onChange }: Props) {
  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          <Popover.Button as="div">
            <Avatar data={data} size="md" className="cursor-pointer hover:opacity-80" />
          </Popover.Button>

          <Popover.Panel className="absolute z-10 top-full mt-2 left-0">
            <AvatarEditor
              data={data}
              onChange={(newData) => {
                onChange(newData)
                close()
              }}
            />
          </Popover.Panel>
        </>
      )}
    </Popover>
  )
} 