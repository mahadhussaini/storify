'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    console.log('Connecting to Socket.io server:', socketUrl)

    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
    })

    socketInstance.on('connect', () => {
      console.log('✅ Connected to socket server at', socketUrl)
      console.log('📡 Socket ID:', socketInstance.id)
      setIsConnected(true)

      // Send user authentication if session exists
      if (session?.user) {
        console.log('🔐 Authenticating user...')
        socketInstance.emit('authenticate', {
          userId: (session.user as any).id,
          name: session.user.name,
          email: session.user.email,
        })
      }
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Disconnected from socket server:', reason)
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('🚫 Socket connection error:', error.message)
      console.error('🔍 Error details:', error)
      setIsConnected(false)
    })

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected to socket server after', attemptNumber, 'attempts')
      setIsConnected(true)
    })

    socketInstance.on('reconnect_error', (error) => {
      console.error('🔄 Reconnection failed:', error.message)
    })

    socketInstance.on('reconnect_failed', () => {
      console.error('🔄 Reconnection failed completely')
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [session])

  // Update authentication when session changes
  useEffect(() => {
    if (socket && session?.user) {
      socket.emit('authenticate', {
        userId: (session.user as any).id,
        name: session.user.name,
        email: session.user.email,
      })
    }
  }, [socket, session])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
