'use client'

import { useState, useMemo } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useWorkspace } from '@/hooks/useWorkspace'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { SearchFilter } from '@/components/ui/SearchFilter'
import { InviteMembersDialog } from '@/components/workspace/InviteMembersDialog'

type SortField = 'name' | 'email' | 'role' | 'joined' | 'lastSeen'
type SortDirection = 'asc' | 'desc'

export default function MembersPage() {
  const { workspace } = useWorkspace()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [disableUserId, setDisableUserId] = useState<string | null>(null)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  const { data: members } = trpc.workspace.getMembers.useQuery(
    { workspaceUrl: workspace?.url || '' },
    { enabled: !!workspace }
  )

  const updateUserStatus = trpc.workspace.updateMemberStatus.useMutation({
    onSuccess: () => {
      setDisableUserId(null)
      // Invalidate the members query to refresh the list
      utils.workspace.getMembers.invalidate()
    }
  })

  const utils = trpc.useContext()

  const filteredAndSortedMembers = useMemo(() => {
    if (!members) return { active: [], pending: [], disabled: [] }

    const filtered = members.filter(member => {
      const searchLower = search.toLowerCase()
      return (
        member.user.name?.toLowerCase().includes(searchLower) ||
        member.user.email.toLowerCase().includes(searchLower) ||
        member.role.toLowerCase().includes(searchLower)
      )
    })

    const sorted = [...filtered].sort((a, b) => {
      let compareA, compareB

      switch (sortField) {
        case 'name':
          compareA = a.user.name || ''
          compareB = b.user.name || ''
          break
        case 'email':
          compareA = a.user.email
          compareB = b.user.email
          break
        case 'role':
          compareA = a.role
          compareB = b.role
          break
        case 'joined':
          compareA = a.createdAt
          compareB = b.createdAt
          break
        case 'lastSeen':
          compareA = a.updatedAt
          compareB = b.updatedAt
          break
        default:
          return 0
      }

      const comparison = compareA < compareB ? -1 : compareA > compareB ? 1 : 0
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return {
      active: sorted.filter(m => m.user.status === 'ACTIVE'),
      pending: sorted.filter(m => m.user.status === 'PENDING'),
      disabled: sorted.filter(m => m.user.status === 'DISABLED')
    }
  }, [members, search, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  const renderMemberSection = (title: string, members: typeof filteredAndSortedMembers.active) => {
    if (members.length === 0) return null

    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                  Name {renderSortIcon('name')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('email')}>
                  Email {renderSortIcon('email')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('role')}>
                  Role {renderSortIcon('role')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('joined')}>
                  Joined {renderSortIcon('joined')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('lastSeen')}>
                  Last seen {renderSortIcon('lastSeen')}
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map(member => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserAvatar user={member.user} className="flex-shrink-0" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(member.updatedAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setDisableUserId(member.user.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <EllipsisHorizontalIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Members
        </h2>
        <div className="flex gap-4">
          <Button variant="outline">Export CSV</Button>
          <Button onClick={() => setIsInviteDialogOpen(true)}>Invite</Button>
        </div>
      </div>

      <div className="flex gap-4">
        <SearchFilter
          onSearch={setSearch}
          className="w-[400px]"
        />
      </div>

      {renderMemberSection('Active', filteredAndSortedMembers.active)}
      {renderMemberSection('Pending', filteredAndSortedMembers.pending)}
      {renderMemberSection('Disabled', filteredAndSortedMembers.disabled)}

      <Dialog
        isOpen={!!disableUserId}
        onClose={() => setDisableUserId(null)}
        title="Disable user"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to disable this user?
          </p>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setDisableUserId(null)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (disableUserId) {
                updateUserStatus.mutate({
                  userId: disableUserId,
                  status: 'DISABLED'
                })
              }
            }}
          >
            Proceed
          </Button>
        </div>
      </Dialog>

      <InviteMembersDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
      />
    </div>
  )
} 