'use client'

import { useEffect } from 'react'
import { trpc } from '../trpc/core/client'

export function useSync() {
  const utils = trpc.useContext()

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!)
    
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data)
      
      switch (type) {
      //   case 'ISSUE_UPDATED':
      //     utils.issue.get.invalidate({ id: data.issueId })
      //     utils.issue.list.invalidate()
      //     break
      //   case 'COMMENT_ADDED':
      //     utils.comment.list.invalidate({ issueId: data.issueId })
      //     break
      //   // ... handle other events
      // }
    }

    return () => ws.close()
  }, [utils])
} 