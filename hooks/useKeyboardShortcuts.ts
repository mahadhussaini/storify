import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Find matching shortcut
    const shortcut = shortcuts.find(shortcut => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = !!event.ctrlKey === !!shortcut.ctrlKey
      const shiftMatch = !!event.shiftKey === !!shortcut.shiftKey
      const altMatch = !!event.altKey === !!shortcut.altKey
      const metaMatch = !!event.metaKey === !!shortcut.metaKey

      return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch
    })

    if (shortcut) {
      event.preventDefault()
      shortcut.action()
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Return shortcut descriptions for help display
  return shortcuts.map(({ key, ctrlKey, shiftKey, altKey, metaKey, description }) => {
    const modifiers = []
    if (ctrlKey) modifiers.push('Ctrl')
    if (shiftKey) modifiers.push('Shift')
    if (altKey) modifiers.push('Alt')
    if (metaKey) modifiers.push('Cmd')

    const shortcutText = [...modifiers, key.toUpperCase()].join(' + ')
    return { shortcut: shortcutText, description }
  })
}
