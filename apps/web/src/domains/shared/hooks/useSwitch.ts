'use client'

import { useState } from 'react'

export function useSwitch(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  return {
    value,
    toggle: () => setValue(!value),
    on: () => setValue(true),
    off: () => setValue(false)
  }
} 