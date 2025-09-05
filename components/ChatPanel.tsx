'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/lib/socket-context'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/lib/utils'
import Image from 'next/image'

interface User {
  id: string
  name: string
  image?: string
  isTyping: boolean
  cursorPosition: number
  color: string
}

interface ChatMessage {
  id: string
  content: string
  author: {
    id: string
    name: string
    image?: string
  }
  timestamp: string
}

interface ChatPanelProps {
  storyId: string
  users: User[]
  onClose: () => void
  isMobile?: boolean
}

export function ChatPanel({ storyId, users, onClose, isMobile = false }: ChatPanelProps) {
  const { data: session } = useSession()
  const { socket, isConnected } = useSocket()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load chat messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/stories/${storyId}/chat`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error('Error loading chat messages:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [storyId])

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleChatMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    }

    socket.on('chat-message', handleChatMessage)

    return () => {
      socket.off('chat-message', handleChatMessage)
    }
  }, [socket, isConnected])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !session?.user) return

    try {
      if (socket && isConnected) {
        socket.emit('chat-message', {
          message: newMessage.trim()
        })
      }

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as any)
    }
  }

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-800 ${isMobile ? 'max-h-[60vh]' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Chat</h3>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {users.length} online
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="p-1 sm:p-2">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3 space-y-3' : 'p-4 space-y-4'}`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className={`text-gray-400 mx-auto mb-4 ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`} />
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex space-x-3 ${
                message.author.id === (session?.user as any)?.id ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.author.image ? (
                  <Image
                    src={message.author.image}
                    alt={message.author.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {message.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Message content */}
              <div className={`flex-1 min-w-0 ${
                message.author.id === (session?.user as any)?.id ? 'text-right' : ''
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {message.author.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(message.timestamp)}
                  </span>
                </div>

                <div
                  className={`inline-block px-3 py-2 rounded-lg max-w-xs break-words ${
                    message.author.id === (session?.user as any)?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} border-t border-gray-200 dark:border-gray-700`}>
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className={`${isMobile ? 'px-2 py-2 text-sm' : 'px-3 py-2'} flex-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            size="sm"
            className={isMobile ? 'p-2' : ''}
          >
            <Send className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
          </Button>
        </form>

        {!isConnected && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            Disconnected from chat
          </p>
        )}
      </div>
    </div>
  )
}
