'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface Cursor {
  userId: string
  name: string
  position: number
  selection?: { start: number; end: number }
  color: string
}

interface UserPresence {
  id: string
  name: string
  image?: string
  isTyping: boolean
  cursorPosition: number
  color: string
}

interface LiveEditorProps {
  content: string
  onChange: (content: string) => void
  onCursorUpdate: (position: number, selection?: any) => void
  onTypingStart: () => void
  onTypingStop: () => void
  cursors: Cursor[]
  users: UserPresence[]
}

export function LiveEditor({
  content,
  onChange,
  onCursorUpdate,
  onTypingStart,
  onTypingStop,
  cursors,
  users
}: LiveEditorProps) {
  const [localContent, setLocalContent] = useState(content)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Update local content when prop changes (from other users)
  useEffect(() => {
    setLocalContent(content)
  }, [content])

  // Handle text changes
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setLocalContent(newContent)
    onChange(newContent)

    // Handle typing indicators
    onTypingStart()
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop()
    }, 1000)
  }, [onChange, onTypingStart, onTypingStop])

  // Handle cursor and selection changes
  const handleSelectionChange = useCallback(() => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    setCursorPosition(start)

    if (start !== end) {
      setSelection({ start, end })
      onCursorUpdate(start, { start, end })
    } else {
      setSelection(null)
      onCursorUpdate(start)
    }
  }, [onCursorUpdate])

  // Render live cursors (disabled - no real-time collaboration)
  const renderCursors = () => {
    return null
  }

  // Render typing indicators (disabled - no real-time collaboration)
  const renderTypingIndicators = () => {
    return null
  }

  return (
    <div className="relative min-h-screen">
      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={localContent}
        onChange={handleTextChange}
        onSelect={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        onClick={handleSelectionChange}
        className="story-editor w-full h-full resize-none bg-transparent focus:outline-none"
        placeholder="Start writing your story..."
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          lineHeight: '1.8',
          letterSpacing: '0.01em',
          fontSize: '16px',
          padding: '1rem 1.5rem 2rem', // Reduced padding on mobile
          minHeight: 'calc(100vh - 56px)' // Account for mobile header height
        }}
      />

      {/* Live cursors */}
      {renderCursors()}

      {/* Typing indicators */}
      {renderTypingIndicators()}

      {/* Character/Word count - Mobile responsive */}
      <div className="fixed bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-2 py-1 sm:px-3 sm:py-2 z-40">
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <span className="hidden sm:inline">
            {localContent.length} characters • {localContent.split(/\s+/).filter(word => word.length > 0).length} words
          </span>
          <span className="sm:hidden">
            {localContent.split(/\s+/).filter(word => word.length > 0).length} words
          </span>
        </div>
      </div>
    </div>
  )
}
