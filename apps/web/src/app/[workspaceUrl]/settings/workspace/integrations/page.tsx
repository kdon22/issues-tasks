// 'use client'

// import { Suspense } from 'react'
// import { trpc } from '@/infrastructure/trpc/core/client'
// import { useRealTimeQuery } from '@/domains/shared/hooks'
// import { useOptimisticUpdate } from '@/domains/shared/hooks/useOptimisticUpdate'
// import { ErrorBoundary } from '@/domains/shared/components/feedback/ErrorBoundary'
// import { IntegrationsList } from '@/domains/workspaces/components/IntegrationsList'
// import { LoadingSpinner } from '@/domains/shared/components/feedback/LoadingSpinner'

// export default function IntegrationsPage({
//   params
// }: {
//   params: { workspaceUrl: string }
// }) {
//   const utils = trpc.useContext()
//   const queryKey = ['workspace', params.workspaceUrl, 'integrations']

//   const { data: integrations } = useRealTimeQuery(
//     queryKey,
//     () => trpc.workspace.getIntegrations.query({ url: params.workspaceUrl }),
//     {
//       duration: 'MEDIUM',
//       optimistic: true
//     }
//   )

//   const { mutate: updateIntegration } = trpc.integration.update.useMutation({
//     onMutate: async (newData) => {
//       await utils.integration.get.cancel()
//       const previous = utils.integration.get.getData()
//       utils.integration.get.setData({ id: newData.id }, (old) => ({ ...old, ...newData }))
//       return { previous }
//     },
//     onError: (err, newData, context) => {
//       utils.integration.get.setData({ id: newData.id }, context?.previous)
//     },
//     onSettled: (data) => {
//       utils.integration.get.invalidate({ id: data?.id })
//     }
//   })

//   return (
//     <ErrorBoundary>
//       <Suspense fallback={<LoadingSpinner />}>
//         <IntegrationsList
//           integrations={integrations}
//           onUpdate={async (data) => {
//             await updateIntegration.optimisticUpdate(old => ({
//               ...old!,
//               ...data
//             }))
//             await utils.workspace.updateIntegration.mutate({
//               url: params.workspaceUrl,
//               ...data
//             })
//           }}
//         />
//       </Suspense>
//     </ErrorBoundary>
//   )
// } 