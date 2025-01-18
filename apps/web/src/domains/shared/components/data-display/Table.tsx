'use client'

import { useState } from 'react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Input } from '@/domains/shared/components/inputs'
import { cn } from '@/domains/shared/utils/cn'
import { trpc } from '@/infrastructure/trpc/core/client'

export interface Column<T> {
  header: string
  accessorKey: keyof T
  sortable?: boolean
  cell?: (value: any, item: T) => React.ReactNode
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  className?: string
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  className
}: TableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T
    direction: 'asc' | 'desc'
  } | null>(null)

  // Filter data based on search query
  const filteredData = searchQuery
    ? data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : data

  // Sort data if sort config exists
  const sortedData = sortConfig
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    : filteredData

  const handleSort = (key: keyof T) => {
    setSortConfig(current => ({
      key,
      direction:
        current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  return (
    <div className={className}>
      {searchable && (
        <div className="mb-4">
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={String(column.accessorKey)}
                  scope="col"
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100'
                  )}
                  onClick={() =>
                    column.sortable && handleSort(column.accessorKey)
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <ChevronUpDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map(column => (
                  <td
                    key={String(column.accessorKey)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.cell
                      ? column.cell(item[column.accessorKey], item)
                      : item[column.accessorKey]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 