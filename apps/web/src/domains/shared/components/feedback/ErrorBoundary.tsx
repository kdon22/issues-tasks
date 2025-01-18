'use client'

import { Component, type ReactNode } from 'react'
import { Alert } from '@/domains/shared/components/feedback/Alert/Alert'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Alert variant="error">
          <h3 className="font-semibold">Something went wrong</h3>
          <p className="text-sm">{this.state.error?.message}</p>
        </Alert>
      )
    }

    return this.props.children
  }
} 