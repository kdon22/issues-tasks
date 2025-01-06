'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, FolderClosed, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavItemProps, FolderItemProps, TeamSectionProps } from './types'

export const NavItem: React.FC<NavItemProps> = ({ 
  icon: Icon, 
  label, 
  isActive, 
  hasDropdown,
  href,
  children 
}) => {
  const pathname = usePathname()
  const isCurrentPath = href ? pathname === href : isActive

  const Content = (
    <div className={`flex items-center gap-2 px-2 py-1.5 text-gray-800 hover:bg-gray-100 rounded-md ${
      isCurrentPath ? 'bg-gray-100 text-gray-900' : ''
    }`}>
      <Icon size={18} className="text-gray-700" />
      <span className="text-sm flex-1">{label}</span>
      {hasDropdown && <ChevronDown size={14} className="text-gray-500" />}
    </div>
  )

  return (
    <div className="flex flex-col">
      {href ? (
        <Link href={href}>{Content}</Link>
      ) : (
        Content
      )}
      {children}
    </div>
  )
}

export const FolderItem: React.FC<FolderItemProps> = ({ label, isNested, href }) => {
  const Content = (
    <div className="group flex items-center gap-2 px-2 py-1.5 text-gray-800 hover:bg-gray-100 rounded-md">
      <FolderClosed size={16} className="text-gray-600" />
      <span className="text-sm flex-1">{label}</span>
    </div>
  )

  return (
    <div className={`flex flex-col ${isNested ? 'ml-8' : ''}`}>
      {href ? (
        <Link href={href}>{Content}</Link>
      ) : (
        Content
      )}
    </div>
  )
}

export const TeamSection: React.FC<TeamSectionProps> = ({ label, icon: Icon, children }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  
  return (
    <div className="flex flex-col">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-2 py-1.5 text-gray-800 hover:bg-gray-100 rounded-md"
      >
        <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
          <Icon size={14} className="text-green-700" />
        </div>
        <span className="text-sm font-medium flex-1">{label}</span>
        <ChevronDown 
          size={14} 
          className={`text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
        />
      </button>
      {isExpanded && (
        <div className="ml-2 mt-1 flex flex-col gap-0.5">
          {children}
        </div>
      )}
    </div>
  )
}

export const FavoritesSection: React.FC = () => {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isCreatingFolder) {
      inputRef.current?.focus()
    }
  }, [isCreatingFolder])

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      // Handle folder creation logic here
      console.log('Creating folder:', newFolderName)
      setNewFolderName('')
    }
    setIsCreatingFolder(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateFolder()
    } else if (e.key === 'Escape') {
      setIsCreatingFolder(false)
      setNewFolderName('')
    }
  }

  const handleClickOutside = () => {
    if (newFolderName.trim()) {
      handleCreateFolder()
    } else {
      setIsCreatingFolder(false)
    }
  }

  return (
    <div className="mt-4">
      <div className="group px-3 mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Favorites</span>
        <button 
          onClick={() => setIsCreatingFolder(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-gray-500 hover:bg-gray-100 rounded p-1"
        >
          <FolderClosed size={14} />
          <Plus size={12} />
        </button>
      </div>

      {isCreatingFolder && (
        <div className="px-2">
          <div className="relative">
            <div 
              className="fixed inset-0" 
              onClick={handleClickOutside}
            />
            <div className="relative flex items-center bg-white border border-blue-500 rounded-md overflow-hidden shadow-sm">
              <FolderClosed size={16} className="absolute left-2 text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Folder name..."
                className="w-full pl-8 pr-3 py-1.5 text-sm text-gray-900 placeholder-gray-500 bg-transparent focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 