import type { QueryKey } from '@tanstack/react-query'

interface SubscribeOptions {
  onConnect?: () => void
  onDisconnect?: () => void
  onData?: (data: any) => void
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

class RealtimeClient {
  private socket: WebSocket | null = null
  private subscriptions = new Map<string, Set<SubscribeOptions>>()

  private connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return

    this.socket = new WebSocket(WS_URL)
    
    this.socket.onopen = () => {
      this.subscriptions.forEach((subs, channel) => {
        subs.forEach(sub => sub.onConnect?.())
      })
    }

    this.socket.onclose = () => {
      this.subscriptions.forEach((subs, channel) => {
        subs.forEach(sub => sub.onDisconnect?.())
      })
    }

    this.socket.onmessage = (event) => {
      const { channel, data } = JSON.parse(event.data)
      const subs = this.subscriptions.get(channel)
      subs?.forEach(sub => sub.onData?.(data))
    }
  }

  getChannelFromKey(queryKey: QueryKey): string {
    return queryKey.join('.')
  }

  subscribe(channel: string, options: SubscribeOptions) {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set())
    }
    this.subscriptions.get(channel)?.add(options)
    this.connect()
  }

  unsubscribe(channel: string, options: SubscribeOptions) {
    this.subscriptions.get(channel)?.delete(options)
    if (this.subscriptions.get(channel)?.size === 0) {
      this.subscriptions.delete(channel)
    }
  }
}

const client = new RealtimeClient()

export function subscribeToUpdates(queryKey: QueryKey, options: SubscribeOptions) {
  const channel = client.getChannelFromKey(queryKey)
  client.subscribe(channel, options)
  
  return () => client.unsubscribe(channel, options)
} 