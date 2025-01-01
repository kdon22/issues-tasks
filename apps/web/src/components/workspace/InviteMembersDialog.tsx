'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { trpc } from '@/lib/trpc/client'
import { TextArea } from '@/components/ui/TextArea'

interface InviteMembersDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function InviteMembersDialog({ isOpen, onClose }: InviteMembersDialogProps) {
  const [emails, setEmails] = useState('')
  const [role, setRole] = useState('MEMBER')
  const [error, setError] = useState('')
  const [selectedTeams, setSelectedTeams] = useState<Array<{ id: string, name: string }>>([])
  const [isTeamsDropdownOpen, setIsTeamsDropdownOpen] = useState(false)
  const teamsDropdownRef = useRef<HTMLDivElement>(null)

  const { data: teams } = trpc.workspace.getTeams.useQuery()

  // Handle click outside to close teams dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (teamsDropdownRef.current && !teamsDropdownRef.current.contains(event.target as Node)) {
        setIsTeamsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const utils = trpc.useContext()
  const inviteMutation = trpc.workspace.inviteMembers.useMutation({
    onSuccess: () => {
      utils.workspace.getMembers.invalidate()
      onClose()
      setEmails('')
      setRole('MEMBER')
      setSelectedTeams([])
      setError('')
    },
    onError: (error) => {
      setError(error.message)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailList = emails.split(/[\s,]+/).filter(Boolean)
    
    if (emailList.length === 0) {
      setError('Please enter at least one email address')
      return
    }

    inviteMutation.mutate({
      emails: emailList,
      role: role as 'ADMIN' | 'MEMBER' | 'GUEST',
      teamIds: selectedTeams.map(team => team.id)
    })
  }

  const removeTeam = (teamId: string) => {
    setSelectedTeams(teams => teams.filter(t => t.id !== teamId))
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Invite members"
      className="sm:max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email addresses
          </label>
          <TextArea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="Enter email addresses (comma or space separated)"
            className="min-h-[4.5rem]"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter multiple emails separated by commas or spaces
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <Dropdown
            value={role}
            onChange={setRole}
            options={[
              { label: 'Member', value: 'MEMBER' },
              { label: 'Admin', value: 'ADMIN' },
              { label: 'Guest', value: 'GUEST' }
            ]}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add to team (optional)
          </label>
          <div className="relative" ref={teamsDropdownRef}>
            <div 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer"
              onClick={() => setIsTeamsDropdownOpen(!isTeamsDropdownOpen)}
            >
              {selectedTeams.length === 0 ? (
                <span className="text-gray-500">Select teams...</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedTeams.map(team => (
                    <span 
                      key={team.id} 
                      className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                    >
                      {team.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeTeam(team.id)
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {isTeamsDropdownOpen && teams && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
                <div className="py-1">
                  {teams.map(team => (
                    <div
                      key={team.id}
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                        selectedTeams.some(t => t.id === team.id) ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => {
                        if (!selectedTeams.some(t => t.id === team.id)) {
                          setSelectedTeams([...selectedTeams, { id: team.id, name: team.name }])
                        }
                      }}
                    >
                      {team.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={inviteMutation.isLoading}
          >
            {inviteMutation.isLoading ? 'Inviting...' : 'Send invites'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
} 