'use client'

import { Component, ReactNode, useEffect } from 'react'
import { suppressBrowserExtensionWarnings } from '@/lib/suppress-browser-extension-warnings'

interface HydrationBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface HydrationBoundaryState {
  hasError: boolean
  error?: Error
}

export class HydrationBoundary extends Component<HydrationBoundaryProps, HydrationBoundaryState> {
  private cleanupConsole?: () => void

  constructor(props: HydrationBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidMount() {
    // Suppress browser extension warnings
    this.cleanupConsole = suppressBrowserExtensionWarnings()
  }

  componentWillUnmount() {
    // Restore original console methods
    if (this.cleanupConsole) {
      this.cleanupConsole()
    }
  }

  static getDerivedStateFromError(error: Error): HydrationBoundaryState {
    // Check if this is a browser extension-related hydration error
    const isBrowserExtensionError = error.message?.includes('data-new-gr-c-s-check-loaded') ||
                                   error.message?.includes('data-gr-ext-installed') ||
                                   error.message?.includes('Extra attributes from the server')

    if (isBrowserExtensionError) {
      // Suppress the error by not throwing it
      console.warn('Browser extension hydration warning suppressed:', error.message)
      return { hasError: false }
    }

    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Check if this is a browser extension-related hydration error
    const isBrowserExtensionError = error.message?.includes('data-new-gr-c-s-check-loaded') ||
                                   error.message?.includes('data-gr-ext-installed') ||
                                   error.message?.includes('Extra attributes from the server')

    if (isBrowserExtensionError) {
      // Suppress the error and don't log it as an error
      console.warn('Browser extension hydration warning caught and suppressed')
      return
    }

    // Only log actual errors, not browser extension warnings
    console.error('Hydration error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Check if this is a browser extension error
      const isBrowserExtensionError = this.state.error.message?.includes('data-new-gr-c-s-check-loaded') ||
                                     this.state.error.message?.includes('data-gr-ext-installed') ||
                                     this.state.error.message?.includes('Extra attributes from the server')

      if (isBrowserExtensionError) {
        // Return children normally, suppressing the error
        return this.props.children
      }

      // For actual errors, show fallback or re-throw
      if (this.props.fallback) {
        return this.props.fallback
      }

      throw this.state.error
    }

    return this.props.children
  }
}
