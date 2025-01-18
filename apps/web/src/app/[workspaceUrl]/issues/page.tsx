// 'use client'

// import { Suspense } from 'react'
// import { ErrorBoundary } from '@/domains/shared/components/feedback/ErrorBoundary'
// import { LoadingSpinner } from '@/domains/shared/components/feedback/LoadingSpinner'
// import { IssuesPageContent } from '@/domains/issues/components/IssuesPageContent'

// export default function IssuesPage({ 
//   params: { workspaceUrl } 
// }: { 
//   params: { workspaceUrl: string } 
// }) {
//   return (
//     <ErrorBoundary>
//       <Suspense fallback={<LoadingSpinner />}>
//         <IssuesPageContent workspaceUrl={workspaceUrl} />
//       </Suspense>
//     </ErrorBoundary>
//   )
// } 