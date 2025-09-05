import { useEffect } from 'react'
import { suppressBrowserExtensionWarnings } from '@/lib/suppress-browser-extension-warnings'

export function useHydrationSuppress() {
  useEffect(() => {
    const cleanup = suppressBrowserExtensionWarnings()
    return cleanup
  }, [])
}
