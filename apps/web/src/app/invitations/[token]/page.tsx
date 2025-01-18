'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LoadingSpinner } from '@/domains/shared/components/feedback/LoadingSpinner'
import { Button } from '@/domains/shared/components/inputs'
import { trpc } from '@/infrastructure/trpc/core/client'

export default function AcceptInvitationPage({
  params
}: {
  params: { token: string }
}) {
  const router = useRouter()
  const { status } = useSession()
  const [error, setError] = useState<string>()
  const utils = trpc.useContext()

  const { mutate: acceptInvitation } = trpc.invitation.accept.useMutation({
    onSuccess: (data) => {
      utils.workspace.invalidate()
      router.push(`/${data.workspace.url}/settings/workspace/teams/${data.teamIds[0]}`)
    },
    onError: (err) => {
      setError(err.message || 'Failed to accept invitation')
    }
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/invitations/${params.token}`)
    }
  }, [status, router, params.token])

  const handleAccept = () => {
    acceptInvitation({ code: params.token })
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo.png"
          alt="IssuesTasks"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Accept Team Invitation
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error ? (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Click the button below to accept your invitation and join the team.
              </p>
              <Button onClick={handleAccept}>
                Accept Invitation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 