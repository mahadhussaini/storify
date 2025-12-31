'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  MessageSquare,
  History,
  Save,
  Settings,
  PenTool,
  Eye,
  EyeOff,
  ArrowLeft,
  Share,
  Download,
  Sparkles,
  Image as ImageIcon,
  BookOpen,
  Lightbulb,
  BarChart3,
  Heart,
  Keyboard,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import { LiveEditor } from '@/components/editor/LiveEditor'
import { ChatPanel } from '@/components/ChatPanel'
import { VersionHistory } from '@/components/VersionHistory'
import { AIAssistant } from '@/components/AIAssistant'
import { ImageUpload } from '@/components/ImageUpload'
import { StoryTemplates } from '@/components/StoryTemplates'
import { WritingPrompts } from '@/components/WritingPrompts'
import { StoryAnalytics } from '@/components/StoryAnalytics'
import { StorySocial } from '@/components/StorySocial'
import { Logo } from '@/components/Logo'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface Story {
  id: string
  title: string
  content: string
  description?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    image?: string
  }
  room?: {
    id: string
    name: string
    isActive: boolean
  }
}

interface UserPresence {
  id: string
  name: string
  image?: string
  isTyping: boolean
  cursorPosition: number
  color: string
}

export default function StoryEditor({ storyId }: { storyId: string }) {
  const { data: session } = useSession()
  const [story, setStory] = useState<Story | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [users, setUsers] = useState<UserPresence[]>([])
  const [cursors, setCursors] = useState<any[]>([])
  const [showChat, setShowChat] = useState(false)
  const [showVersions, setShowVersions] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showPrompts, setShowPrompts] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showSocial, setShowSocial] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)


  // Load story data
  useEffect(() => {
    const loadStory = async () => {
      try {
        const response = await fetch(`/api/stories/${storyId}`)
        if (response.ok) {
          const data = await response.json()
          setStory(data.story)
          setTitle(data.story.title)
          setContent(data.story.content || '')
          setIsPublic(data.story.isPublic)
        } else {
          toast.error('Failed to load story')
        }
      } catch (error) {
        console.error('Error loading story:', error)
        toast.error('Failed to load story')
      } finally {
        setIsLoading(false)
      }
    }

    if (storyId && session) {
      loadStory()
    }
  }, [storyId, session])

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
  }, [])

  // Handle cursor position updates
  const handleCursorUpdate = useCallback((position: number, selection?: any) => {
    // Cursor tracking removed - no real-time collaboration
  }, [])

  // Handle typing indicators
  const handleTypingStart = useCallback(() => {
    // Typing indicators removed - no real-time collaboration
  }, [])

  const handleTypingStop = useCallback(() => {
    // Typing indicators removed - no real-time collaboration
  }, [])

  // Save story
  const handleSave = useCallback(async () => {
    if (!story) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          isPublic
        })
      })

      if (response.ok) {
        toast.success('Story saved successfully!')
        setStory(prev => prev ? { ...prev, updatedAt: new Date().toISOString() } : null)
      } else {
        toast.error('Failed to save story')
      }
    } catch (error) {
      console.error('Error saving story:', error)
      toast.error('Failed to save story')
    } finally {
      setIsSaving(false)
    }
  }, [story, storyId, title, content, isPublic])

  // Handle AI suggestions
  const handleAISuggestion = (suggestion: string) => {
    const newContent = content + (content ? '\n\n' : '') + suggestion
    handleContentChange(newContent)
    toast.success('AI suggestion added to your story!')
  }

  // Handle image uploads
  const handleImageUpload = (imageUrl: string) => {
    const imageMarkdown = `\n\n![Image](${imageUrl})\n\n`
    const newContent = content + imageMarkdown
    handleContentChange(newContent)
    toast.success('Image added to your story!')
  }

  // Handle template selection
  const handleTemplateSelect = (templateContent: string) => {
    handleContentChange(templateContent)
    toast.success('Template applied to your story!')
  }

  // Handle writing prompts
  const handlePromptSelect = (prompt: string) => {
    const promptSection = `\n\n## Writing Prompt\n\n${prompt}\n\n`
    const newContent = content + promptSection
    handleContentChange(newContent)
    toast.success('Prompt added to your story!')
  }

  // Auto-save functionality
  useEffect(() => {
    if (!content || !story) return

    const timer = setTimeout(() => {
      handleSave()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer)
  }, [content, title, handleSave, story])

  // Keyboard shortcuts for AI features
  const shortcuts = useKeyboardShortcuts([
    {
      key: 'a',
      ctrlKey: true,
      shiftKey: true,
      action: () => setShowAI(!showAI),
      description: 'Toggle AI Assistant'
    },
    {
      key: 'p',
      ctrlKey: true,
      shiftKey: true,
      action: () => setShowPrompts(!showPrompts),
      description: 'Toggle Writing Prompts'
    },
    {
      key: 's',
      ctrlKey: true,
      action: handleSave,
      description: 'Save Story'
    },
    {
      key: 'c',
      ctrlKey: true,
      shiftKey: true,
      action: () => setShowChat(!showChat),
      description: 'Toggle Chat'
    },
    {
      key: 'h',
      ctrlKey: true,
      shiftKey: true,
      action: () => setShowVersions(!showVersions),
      description: 'Toggle Version History'
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => setShowKeyboardShortcuts(!showKeyboardShortcuts),
      description: 'Show Keyboard Shortcuts'
    }
  ])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading story...</p>
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Story not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The story you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="p-2 sm:p-3">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Back</span>
                </Button>
              </Link>

              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5">
                  <Logo size="sm" showText={false} />
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg sm:text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 sm:px-2 py-1 text-gray-900 dark:text-white min-w-0 max-w-32 sm:max-w-none"
                  placeholder="Untitled Story"
                />
              </div>
            </div>

            {/* Right side - Mobile optimized */}
            <div className="flex items-center space-x-1 sm:space-x-2">

              {/* Mobile-optimized toolbar */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(!showChat)}
                  className="p-2"
                  title="Chat"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVersions(!showVersions)}
                  className="p-2"
                  title="Version History"
                >
                  <History className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAI(!showAI)}
                  className="p-2"
                  title="AI Assistant"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>

                {/* Mobile: Show only essential buttons, hide others */}
                <div className="hidden lg:flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    title="Upload Image"
                    className="p-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTemplates(!showTemplates)}
                    title="Story Templates"
                    className="p-2"
                  >
                    <BookOpen className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrompts(!showPrompts)}
                    title="Writing Prompts"
                    className="p-2"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    title="Story Analytics"
                    className="p-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSocial(!showSocial)}
                    title="Social Features"
                    className="p-2"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="p-2"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">
                    {isSaving ? 'Saving...' : 'Save'}
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                  className="p-2"
                  title="Keyboard Shortcuts (Ctrl+/)"
                >
                  <Keyboard className="w-4 h-4" />
                </Button>

                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)] h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)]">
        {/* Editor */}
        <div className="flex-1 relative min-h-0">
          <LiveEditor
            content={content}
            onChange={handleContentChange}
            onCursorUpdate={handleCursorUpdate}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            cursors={cursors}
            users={users}
          />
        </div>

        {/* Mobile: Bottom sheet for side panels */}
        <AnimatePresence>
          {(showChat || showVersions || showAI) && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 max-h-[60vh] overflow-hidden flex flex-col"
            >
              {showChat && (
                <ChatPanel
                  storyId={storyId}
                  users={users}
                  onClose={() => setShowChat(false)}
                  isMobile={true}
                />
              )}
              {showVersions && (
                              <VersionHistory
                storyId={storyId}
                onClose={() => setShowVersions(false)}
              />
              )}
              {showAI && (
                              <div className="h-full flex flex-col min-h-0">
                <AIAssistant
                  storyContent={content}
                  onSuggestion={handleAISuggestion}
                  onClose={() => setShowAI(false)}
                />
              </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop: Side panels */}
        <div className="hidden lg:block h-full min-h-0">
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="w-80 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col min-h-0"
              >
                <ChatPanel
                  storyId={storyId}
                  users={users}
                  onClose={() => setShowChat(false)}
                />
              </motion.div>
            )}

            {showVersions && (
              <motion.div
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="w-80 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col min-h-0"
              >
                <VersionHistory
                  storyId={storyId}
                  onClose={() => setShowVersions(false)}
                />
              </motion.div>
            )}

            {showAI && (
              <motion.div
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="w-80 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col min-h-0"
              >
                <AIAssistant
                  storyContent={content}
                  onSuggestion={handleAISuggestion}
                  onClose={() => setShowAI(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Overlay Modals */}
        {showImageUpload && (
          <ImageUpload
            onImageUpload={handleImageUpload}
            onClose={() => setShowImageUpload(false)}
          />
        )}

        {showTemplates && (
          <StoryTemplates
            onSelectTemplate={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        )}

        {showPrompts && (
          <WritingPrompts
            onSelectPrompt={handlePromptSelect}
            onClose={() => setShowPrompts(false)}
          />
        )}

        {showAnalytics && (
          <StoryAnalytics
            storyId={storyId}
            storyContent={content}
            onClose={() => setShowAnalytics(false)}
          />
        )}

        {showSocial && (
          <StorySocial
            storyId={storyId}
            onClose={() => setShowSocial(false)}
          />
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardShortcuts(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3">
              {shortcuts.map(({ shortcut, description }, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    {description}
                  </span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded border">
                    {shortcut}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+/</kbd> to toggle this help
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
