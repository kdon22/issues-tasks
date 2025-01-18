import { createWSClient } from '@trpc/client/links/wsLink'

const wsClient = createWSClient({
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
})

export const wsUtils = {
  subscribe: (channel: string, handlers: {
    onData: (data: any) => void
    onError?: () => void
  }) => {
    const ws = wsClient.getConnection()
    
    const messageHandler = (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      if (data.channel === channel) {
        handlers.onData(data.payload)
      }
    }

    ws.addEventListener('message', messageHandler)
    ws.addEventListener('error', handlers.onError || (() => {}))

    return () => {
      ws.removeEventListener('message', messageHandler)
      ws.removeEventListener('error', handlers.onError || (() => {}))
    }
  },

  send: (event: string, data: any) => {
    const ws = wsClient.getConnection()
    ws.send(JSON.stringify({ event, data }))
  }
} 