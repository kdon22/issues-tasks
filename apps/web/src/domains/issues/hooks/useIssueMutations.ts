// import { useTRPCMutation } from '@/domains/shared/hooks/useTRPCMutation'
// import type { Issue } from '../types/issue'
// import { trpc } from '@/infrastructure/trpc/core/client'

// export function useIssueMutations() {
//   const updateStatusMutation = useTRPCMutation<Issue, 'issue'>({
//     queryKey: { url: '/api/issues' },
//     getData: () => [], // Will be populated by query
//     updateData: (input, currentData) => 
//       currentData.map(issue => 
//         issue.id === input.id ? { ...issue, status: input.status } : issue
//       ),
//     procedure: trpc.issue,
//     type: 'update'
//   })

//   return { 
//     updateStatus: updateStatusMutation.mutate 
//   }
// } 