// Utility to suppress browser extension warnings during development
export function suppressBrowserExtensionWarnings() {
  if (typeof window === 'undefined') return

  const originalWarn = console.warn
  const originalError = console.error

  const suppressedMessages = [
    'Extra attributes from the server',
    'data-new-gr-c-s-check-loaded',
    'data-gr-ext-installed',
    'Warning: Extra attributes from the server',
    'Hydration mismatch',
    'Text content did not match'
  ]

  const isSuppressedMessage = (message: string) => {
    return suppressedMessages.some(suppressed =>
      message.includes(suppressed) &&
      (message.includes('data-new-gr-c-s-check-loaded') ||
       message.includes('data-gr-ext-installed') ||
       message.includes('Grammarly') ||
       message.includes('browser extension'))
    )
  }

  console.warn = (...args) => {
    const message = args.join(' ')
    if (!isSuppressedMessage(message)) {
      originalWarn.apply(console, args)
    }
  }

  console.error = (...args) => {
    const message = args.join(' ')
    if (!isSuppressedMessage(message)) {
      originalError.apply(console, args)
    }
  }

  // Cleanup function to restore original console methods
  return () => {
    console.warn = originalWarn
    console.error = originalError
  }
}
