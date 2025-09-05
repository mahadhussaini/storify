const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8
})

app.use(cors())
app.use(express.json())

// Store active users and rooms
const activeUsers = new Map()
const rooms = new Map()

// Middleware to authenticate socket connections
io.use((socket, next) => {
  // In a real app, you'd verify the JWT token here
  next()
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Handle user authentication
  socket.on('authenticate', (userData) => {
    console.log('User authenticated:', userData)
    activeUsers.set(socket.id, {
      ...userData,
      socketId: socket.id,
      lastSeen: new Date()
    })
    
    socket.user = userData
    socket.emit('authenticated', { success: true })
  })

  // Handle joining a story room
  socket.on('join-room', async (data) => {
    const { roomId, storyId } = data
    console.log(`User ${socket.id} joining room ${roomId}`)
    
    try {
      // Leave previous rooms
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room)
        }
      })

      // Join new room
      socket.join(roomId)
      socket.currentRoom = roomId
      socket.currentStory = storyId

      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          storyId,
          users: new Map(),
          story: { content: '', version: 1 },
          cursors: new Map()
        })
      }

      const room = rooms.get(roomId)
      
      // Add user to room
      if (socket.user) {
        room.users.set(socket.id, {
          ...socket.user,
          socketId: socket.id,
          joinedAt: new Date(),
          isTyping: false,
          cursorPosition: 0
        })
      }

      // Send current room state to user
      socket.emit('room-joined', {
        roomId,
        storyId,
        story: room.story,
        users: Array.from(room.users.values()),
        cursors: Array.from(room.cursors.values())
      })

      // Notify other users in room
      socket.to(roomId).emit('user-joined', {
        user: socket.user,
        timestamp: new Date()
      })

      // Send updated user list to all users in room
      io.to(roomId).emit('users-updated', Array.from(room.users.values()))

    } catch (error) {
      console.error('Error joining room:', error)
      socket.emit('error', { message: 'Failed to join room' })
    }
  })

  // Handle story content changes
  socket.on('story-change', (data) => {
    if (!socket.currentRoom) return

    const { content, delta, version, position } = data
    const room = rooms.get(socket.currentRoom)
    
    if (room) {
      // Update story content
      room.story.content = content
      room.story.version = version || room.story.version + 1
      room.story.lastModified = new Date()
      room.story.lastModifiedBy = socket.user?.name || 'Anonymous'

      // Broadcast changes to other users in room
      socket.to(socket.currentRoom).emit('story-updated', {
        content,
        delta,
        version: room.story.version,
        author: socket.user,
        timestamp: new Date()
      })
    }
  })

  // Handle cursor position updates
  socket.on('cursor-update', (data) => {
    if (!socket.currentRoom) return

    const { position, selection } = data
    const room = rooms.get(socket.currentRoom)
    
    if (room && socket.user) {
      // Update cursor position
      room.cursors.set(socket.id, {
        userId: socket.user.id,
        name: socket.user.name,
        position,
        selection,
        color: getUserColor(socket.user.id),
        timestamp: new Date()
      })

      // Broadcast cursor position to other users
      socket.to(socket.currentRoom).emit('cursor-updated', {
        userId: socket.user.id,
        name: socket.user.name,
        position,
        selection,
        color: getUserColor(socket.user.id)
      })
    }
  })

  // Handle typing indicators
  socket.on('typing-start', () => {
    if (!socket.currentRoom || !socket.user) return

    const room = rooms.get(socket.currentRoom)
    if (room && room.users.has(socket.id)) {
      const user = room.users.get(socket.id)
      user.isTyping = true
      
      socket.to(socket.currentRoom).emit('user-typing', {
        userId: socket.user.id,
        name: socket.user.name,
        isTyping: true
      })
    }
  })

  socket.on('typing-stop', () => {
    if (!socket.currentRoom || !socket.user) return

    const room = rooms.get(socket.currentRoom)
    if (room && room.users.has(socket.id)) {
      const user = room.users.get(socket.id)
      user.isTyping = false
      
      socket.to(socket.currentRoom).emit('user-typing', {
        userId: socket.user.id,
        name: socket.user.name,
        isTyping: false
      })
    }
  })

  // Handle chat messages
  socket.on('chat-message', (data) => {
    if (!socket.currentRoom || !socket.user) return

    const { message } = data
    const chatMessage = {
      id: generateId(),
      content: message,
      author: socket.user,
      timestamp: new Date(),
      roomId: socket.currentRoom
    }

    // Broadcast message to all users in room
    io.to(socket.currentRoom).emit('chat-message', chatMessage)
  })

  // Handle version save requests
  socket.on('save-version', (data) => {
    if (!socket.currentRoom || !socket.user) return

    const { content, description } = data
    const room = rooms.get(socket.currentRoom)
    
    if (room) {
      const version = {
        id: generateId(),
        content,
        description: description || `Version ${room.story.version}`,
        version: room.story.version,
        author: socket.user,
        timestamp: new Date()
      }

      // In a real app, you'd save this to the database
      console.log('Version saved:', version)
      
      // Notify all users
      io.to(socket.currentRoom).emit('version-saved', version)
    }
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    // Remove from active users
    activeUsers.delete(socket.id)

    // Remove from current room
    if (socket.currentRoom) {
      const room = rooms.get(socket.currentRoom)
      if (room) {
        room.users.delete(socket.id)
        room.cursors.delete(socket.id)
        
        // Notify other users
        socket.to(socket.currentRoom).emit('user-left', {
          userId: socket.user?.id,
          name: socket.user?.name,
          timestamp: new Date()
        })

        // Send updated user list
        io.to(socket.currentRoom).emit('users-updated', Array.from(room.users.values()))
        
        // Remove cursor
        io.to(socket.currentRoom).emit('cursor-removed', {
          userId: socket.user?.id
        })

        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(socket.currentRoom)
          console.log(`Room ${socket.currentRoom} cleaned up`)
        }
      }
    }
  })
})

// Helper functions
function getUserColor(userId) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#6C5CE7', '#A29BFE', '#FD79A8', '#E17055', '#00B894'
  ]
  
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  return colors[Math.abs(hash) % colors.length]
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeUsers: activeUsers.size,
    activeRooms: rooms.size,
    timestamp: new Date()
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }

  console.log(`🚀 Socket.io server running on port ${PORT}`)
  console.log(`📡 Server URL: http://localhost:${PORT}`)
  console.log(`🔌 Socket.io endpoint: ws://localhost:${PORT}/socket.io/`)
  console.log(`🌐 CORS origins: ${JSON.stringify(io.engine.opts.cors.origin)}`)
})

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
