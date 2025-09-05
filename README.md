# Storify - Collaborative Story Building App

A real-time collaborative storytelling platform built with Next.js, Socket.io, and Tailwind CSS. Create amazing stories together with friends and fellow writers!

## ✨ Features

### 🚀 Core Features
- **Real-time Collaboration**: Multiple users can write/edit the same story simultaneously
- **Live Cursors**: See where other writers are typing with colored cursors
- **User Presence**: View who is online and actively writing
- **Version History**: Track changes with detailed version history and rollback
- **Chat System**: Built-in chat for brainstorming and discussion
- **AI Assistant**: Get writing suggestions, continuations, and improvements

### 🎨 UI/UX
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Fully Responsive**: Optimized for mobile (320px+), tablet, and desktop (4K+)
- **Touch-Friendly**: Proper touch targets (44px minimum) for mobile devices
- **Adaptive Layout**: Side panels become bottom sheets on mobile
- **Performance Optimized**: Reduced animations on mobile for better performance
- **Modern Interface**: Clean, distraction-free writing environment
- **Real-time Updates**: Instant synchronization across all devices

### 🔐 Authentication
- **Email/Password**: Traditional authentication
- **OAuth**: Google and GitHub integration
- **Anonymous Mode**: Guest accounts for quick access
- **Secure**: JWT tokens and encrypted passwords

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Socket.io, Express
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: OpenAI API integration
- **Real-time**: Socket.io for WebSocket connections
- **Styling**: Tailwind CSS with custom components
- **Animations**: Framer Motion

## 🚀 Getting Started

### ⚡ Quick Deploy to Vercel

```bash
# One-command deployment
npm i -g vercel
vercel login
./deploy-vercel.sh  # Linux/Mac
# OR
deploy-vercel.bat   # Windows

# Then follow the setup guide for database configuration
```

📖 **[Complete Vercel Deployment Guide](VERCEL_DEPLOYMENT.md)**

### Prerequisites
- Node.js 18+ (for local development)
- npm or yarn (for local development)
- Docker & Docker Compose (for containerized deployment)
- Git

### 🚀 Docker Setup (Recommended)

1. **One-command setup**
   ```bash
   # Linux/Mac
   ./setup-docker.sh

   # Windows
   setup-docker.bat
   ```

2. **Manual Docker setup**
   ```bash
   # Build and start all services
   docker-compose up --build

   # Run database migrations
   docker-compose exec app npx prisma migrate dev

   # Generate Prisma client
   docker-compose exec app npx prisma generate
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Socket Server: http://localhost:3001
   - Database: localhost:5432

### 🛠 Local Development Setup

1. **Clone and setup automatically**
   ```bash
   git clone https://github.com/yourusername/storify.git
   cd storify
   npm run setup
   ```

2. **Start both servers**
   ```bash
   npm run dev:full
   ```

3. **Open your browser**
   ```
   http://localhost:3000
   ```

### Manual Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/storify.git
   cd storify
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your configuration:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   GITHUB_CLIENT_ID=""
   GITHUB_CLIENT_SECRET=""

   # OpenAI API (for AI features)
   OPENAI_API_KEY=""

   # Socket.io Server
   NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development servers**

   Terminal 1 - Socket.io Server:
   ```bash
   npm run server
   ```

   Terminal 2 - Frontend:
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Troubleshooting

### WebSocket Connection Issues

If you're seeing WebSocket connection errors:

1. **Check if the Socket.io server is running**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Verify port availability**
   ```bash
   netstat -an | findstr :3001
   ```

3. **Check browser console for errors**
   - Look for CORS errors
   - Check if the WebSocket URL is correct

4. **Restart servers**
   ```bash
   # Kill any existing processes on port 3001
   npx kill-port 3001

   # Restart the Socket.io server
   npm run server
   ```

5. **Firewall/Antivirus**
   - Ensure port 3001 is not blocked by firewall
   - Disable antivirus temporarily for testing

### Common Issues

- **Port 3001 already in use**: Run `npx kill-port 3001`
- **CORS errors**: Check the server CORS configuration
- **Database errors**: Run `npm run db:setup`
- **Missing dependencies**: Run `npm install` in both root and server directories
- **WebSocket connection fails**: Ensure Socket.io server is running on port 3001

### Testing WebSocket Connection

1. **Server Health Check**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Browser Console**: Look for connection logs like "✅ Connected to socket server"

3. **Connection Status**: Check the connection status indicator in the bottom-left corner of the app

## 📁 Project Structure

```
storify/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── story/             # Story editor pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── editor/           # Editor components
│   ├── ui/               # UI components
│   └── ...               # Feature components
├── lib/                  # Utility libraries
│   ├── auth.ts          # Authentication config
│   ├── prisma.ts        # Database client
│   ├── socket-context.tsx # Socket.io context
│   └── utils.ts         # Helper functions
├── prisma/               # Database schema
│   └── schema.prisma    # Prisma schema
├── server/               # Socket.io server
│   └── index.js         # Server implementation
└── public/              # Static assets
```

## 🔧 API Endpoints

### Stories
- `GET /api/stories` - List stories
- `POST /api/stories` - Create story
- `GET /api/stories/[id]` - Get story
- `PATCH /api/stories/[id]` - Update story
- `DELETE /api/stories/[id]` - Delete story

### Versions
- `GET /api/stories/[id]/versions` - Get version history
- `POST /api/stories/[id]/versions` - Save version
- `POST /api/stories/[id]/restore` - Restore version

### Rooms
- `POST /api/rooms` - Create room
- `POST /api/rooms/join` - Join room

### Chat
- `GET /api/stories/[id]/chat` - Get chat messages

### AI
- `POST /api/ai/assist` - Get AI assistance

## 🔌 Socket.io Events

### Client → Server
- `authenticate` - Authenticate user
- `join-room` - Join story room
- `story-change` - Update story content
- `cursor-update` - Update cursor position
- `typing-start/stop` - Typing indicators
- `chat-message` - Send chat message
- `save-version` - Save story version

### Server → Client
- `authenticated` - Authentication success
- `room-joined` - Room join success
- `story-updated` - Story content update
- `user-joined/left` - User presence updates
- `users-updated` - User list update
- `cursor-updated/removed` - Cursor updates
- `user-typing` - Typing indicators
- `chat-message` - New chat message
- `version-saved` - Version saved

## 🎨 Customization

### Themes
The app supports dark and light themes. You can customize the color scheme in `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        // ... more colors
      }
    }
  }
}
```

### AI Prompts
Customize AI prompts in `app/api/ai/assist/route.ts` to match your writing style preferences.

## 🚀 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Backend (Socket.io Server)
```bash
# Build for production
npm run build

# Deploy to your preferred hosting service
# (Heroku, Railway, DigitalOcean, etc.)
```

### Database
- **Development**: SQLite (local)
- **Production**: PostgreSQL, MySQL, or MongoDB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Socket.io](https://socket.io/) - Real-time communication
- [Prisma](https://prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [OpenAI](https://openai.com/) - AI assistance

## 🔧 Troubleshooting

### Socket.io Connection Issues

If you see "WebSocket connection failed" errors:

1. **Verify server is running**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return server status information.

2. **Test Socket.io connection**
   - Open: http://localhost:3000/test-socket.html
   - Should show green "Connected" status

3. **Common solutions**
   - **Port blocked**: Ensure port 3001 isn't blocked by firewall/antivirus
   - **Environment variables**: Check `NEXT_PUBLIC_SOCKET_URL` is set correctly
   - **CORS issues**: Verify frontend URL is in server's CORS allowlist
   - **Browser cache**: Clear browser cache and hard refresh (Ctrl+F5)

4. **Manual testing**
   ```bash
   # Test server health
   curl http://localhost:3001/health

   # Test Socket.io handshake
   curl -X POST http://localhost:3001/socket.io/ \
     -H "Content-Type: application/json" \
     -d '{"sid":"","upgrades":[],"pingInterval":25000,"pingTimeout":5000}'
   ```

### Database Issues

If you encounter database errors:

1. **Regenerate Prisma client**
   ```bash
   npx prisma generate
   ```

2. **Reset database**
   ```bash
   npx prisma db push --force-reset
   ```

3. **Check database file**
   - SQLite: Ensure `dev.db` exists in project root
   - Other databases: Verify connection string in `.env.local`

### Build Issues

If builds fail:

1. **Clear cache**
   ```bash
   rm -rf .next node_modules/.cache
   npm install
   ```

2. **Check Node.js version**
   ```bash
   node --version  # Should be 16+
   ```

3. **Rebuild dependencies**
   ```bash
   npm run setup
   ```

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

## 🐳 Docker Deployment

### Services
- **app**: Next.js frontend application
- **socket-server**: Socket.io real-time server
- **db**: PostgreSQL database

### Environment Variables
Copy `docker.env` to your production environment and update:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_SECRET="your-production-secret"
OPENAI_API_KEY="your-openai-key"
```

### Production Deployment
```bash
# Build for production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

---

Happy writing! ✍️
