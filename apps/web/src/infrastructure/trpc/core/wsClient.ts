import { createWSClient } from '@trpc/client'

export const wsClient = typeof window !== 'undefined' 
  ? createWSClient({
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
    })
  : null

export type WSClient = typeof wsClient 