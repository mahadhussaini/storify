'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/lib/socket-context'
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
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import { LiveEditor } from '@/components/editor/LiveEditor'
import { UserPresence } from '@/components/UserPresence'
import { ChatPanel } from '@/components/ChatPanel'
import { VersionHistory } from '@/components/VersionHistory'
import { AIAssistant } from '@/components/AIAssistant'
import { ImageUpload } from '@/components/ImageUpload'
import { StoryTemplates } from '@/components/StoryTemplates'
import { WritingPrompts } from '@/components/WritingPrompts'
import { StoryAnalytics } from '@/components/StoryAnalytics'
import { StorySocial } from '@/components/StorySocial'
import { Logo } from '@/components/Logo'

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
  const { socket, isConnected } = useSocket()
  const [story, setStory] = useState<Story | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [users, setUsers] = useState<UserPresence[]>([])
  const [cursors, setCursors] = useState<any[]>([])
  const [showChat, setShowChat] = useState(false)
  const [showVersions, setShowVersions] = useState(false)
  const [showPresence, setShowPresence] = useState(true)
  const [showAI, setShowAI] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showPrompts, setShowPrompts] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showSocial, setShowSocial] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleRoomJoined = (data: any) => {
      console.log('Joined room:', data)
      setUsers(data.users || [])
      setCursors(data.cursors || [])
      if (data.story) {
        setContent(data.story.content || '')
      }
    }

    const handleStoryUpdated = (data: any) => {
      if (data.author?.id !== (session?.user as any)?.id) {
        setContent(data.content)
      }
    }

    const handleUserJoined = (data: any) => {
      console.log('User joined:', data.user.name)
      toast.success(`${data.user.name} joined the story`)
    }

    const handleUserLeft = (data: any) => {
      console.log('User left:', data.user?.name)
      toast(`${data.user?.name || 'A user'} left the story`)
    }

    const handleUsersUpdated = (users: UserPresence[]) => {
      setUsers(users)
    }

    const handleCursorUpdated = (data: any) => {
      setCursors(prev => {
        const existing = prev.find(c => c.userId === data.userId)
        if (existing) {
          return prev.map(c => c.userId === data.userId ? { ...c, ...data } : c)
        }
        return [...prev, data]
      })
    }

    const handleCursorRemoved = (data: any) => {
      setCursors(prev => prev.filter(c => c.userId !== data.userId))
    }

    const handleUserTyping = (data: any) => {
      setUsers(prev => prev.map(u =>
        u.id === data.userId
          ? { ...u, isTyping: data.isTyping }
          : u
      ))
    }

    // Register event listeners
    socket.on('room-joined', handleRoomJoined)
    socket.on('story-updated', handleStoryUpdated)
    socket.on('user-joined', handleUserJoined)
    socket.on('user-left', handleUserLeft)
    socket.on('users-updated', handleUsersUpdated)
    socket.on('cursor-updated', handleCursorUpdated)
    socket.on('cursor-removed', handleCursorRemoved)
    socket.on('user-typing', handleUserTyping)

    return () => {
      socket.off('room-joined', handleRoomJoined)
      socket.off('story-updated', handleStoryUpdated)
      socket.off('user-joined', handleUserJoined)
      socket.off('user-left', handleUserLeft)
      socket.off('users-updated', handleUsersUpdated)
      socket.off('cursor-updated', handleCursorUpdated)
      socket.off('cursor-removed', handleCursorRemoved)
      socket.off('user-typing', handleUserTyping)
    }
  }, [socket, isConnected, session])

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

          // Join the room if it exists
          if (socket && data.story.room) {
            socket.emit('join-room', {
              roomId: data.story.room.id,
              storyId: storyId
            })
          }
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
  }, [storyId, session, socket])

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)

    // Emit changes to other users
    if (socket && isConnected) {
      socket.emit('story-change', {
        content: newContent,
        timestamp: new Date()
      })
    }
  }, [socket, isConnected])

  // Handle cursor position updates
  const handleCursorUpdate = useCallback((position: number, selection?: any) => {
    if (socket && isConnected) {
      socket.emit('cursor-update', {
        position,
        selection
      })
    }
  }, [socket, isConnected])

  // Handle typing indicators
  const handleTypingStart = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('typing-start')
    }
  }, [socket, isConnected])

  const handleTypingStop = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('typing-stop')
    }
  }, [socket, isConnected])

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

            {/* Center - Connection status - Hidden on mobile, shown on larger screens */}
            <div className="hidden md:flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Disconnected</span>
                </div>
              )}

              {users.length > 1 && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {users.length} online
                  </span>
                </div>
              )}
            </div>

            {/* Right side - Mobile optimized */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Mobile connection indicator */}
              <div className="md:hidden">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} title={isConnected ? 'Connected' : 'Disconnected'}></div>
              </div>

              {/* Mobile-optimized toolbar */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPresence(!showPresence)}
                  className="p-2"
                  title="Toggle Presence"
                >
                  {showPresence ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>

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

                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)]">
        {/* Editor */}
        <div className="flex-1 relative">
          <LiveEditor
            content={content}
            onChange={handleContentChange}
            onCursorUpdate={handleCursorUpdate}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            cursors={cursors}
            users={users}
            showPresence={showPresence}
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
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 max-h-[60vh] overflow-hidden"
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
                              <AIAssistant
                storyContent={content}
                onSuggestion={handleAISuggestion}
                onClose={() => setShowAI(false)}
              />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop: Side panels */}
        <div className="hidden lg:block">
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700"
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
                className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700"
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
                className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700"
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

      {/* User presence indicator */}
      {showPresence && users.length > 1 && (
        <UserPresence users={users} />
      )}
    </div>
  )
}
