'use client'

import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import Image from 'next/image'

interface User {
  id: string
  name: string
  image?: string
  isTyping: boolean
  cursorPosition: number
  color: string
}

interface UserPresenceProps {
  users: User[]
}

export function UserPresence({ users }: UserPresenceProps) {
  if (users.length <= 1) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-16 sm:top-20 right-2 sm:right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 sm:p-3 z-30 max-w-xs sm:max-w-sm"
    >
      <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-3">
        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
          {users.length} online
        </span>
      </div>

      <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
        {users.slice(0, 8).map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 sm:space-x-3"
          >
            <div className="relative">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                />
              ) : (
                <div
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>

              {/* Typing indicator */}
              {user.isTyping && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center"
                >
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-pulse"></div>
                </motion.div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              {user.isTyping && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  typing...
                </p>
              )}
            </div>
          </motion.div>
        ))}

        {users.length > 8 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
            +{users.length - 8} more
          </div>
        )}
      </div>
    </motion.div>
  )
}
