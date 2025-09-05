'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { SocketProvider } from '@/lib/socket-context'
import { ClientOnly } from '@/components/ClientOnly'
import { HydrationBoundary } from '@/components/HydrationBoundary'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HydrationBoundary>
      <SessionProvider>
        <ClientOnly>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SocketProvider>
              {children}
            </SocketProvider>
          </ThemeProvider>
        </ClientOnly>
      </SessionProvider>
    </HydrationBoundary>
  )
}
