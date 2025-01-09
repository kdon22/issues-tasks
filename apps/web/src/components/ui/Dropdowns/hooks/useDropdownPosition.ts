import { useState, useEffect, RefObject } from 'react'
import { DropdownPosition } from '../types'

export const useDropdownPosition = (
  buttonRef: RefObject<HTMLButtonElement>,
  dropdownWidth: number
) => {
  const [position, setPosition] = useState<DropdownPosition>('down')

  useEffect(() => {
    const calculatePosition = () => {
      if (!buttonRef.current) return

      const buttonRect = buttonRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const spaceLeft = buttonRect.left
      const spaceRight = viewportWidth - buttonRect.right

      if (spaceLeft < dropdownWidth) {
        if (spaceRight < dropdownWidth) {
          setPosition('down')
        } else {
          setPosition('right')
        }
      } else {
        setPosition('left')
      }
    }

    calculatePosition()
    window.addEventListener('resize', calculatePosition)
    window.addEventListener('scroll', calculatePosition)

    return () => {
      window.removeEventListener('resize', calculatePosition)
      window.removeEventListener('scroll', calculatePosition)
    }
  }, [buttonRef, dropdownWidth])

  return position
} 