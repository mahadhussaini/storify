# Storify - Collaborative Story Building App

A collaborative storytelling platform built with Next.js and Tailwind CSS. Create amazing stories with friends and fellow writers!

## ✨ Features

### 🚀 Core Features
- **Story Management**: Create, edit, and manage your stories
- **Version History**: Track changes with detailed version history and rollback
- **Chat System**: Built-in chat for brainstorming and discussion
- **AI Assistant**: Get writing suggestions, continuations, and improvements

### 🤖 AI Features
- **Writing Assistant**: Get AI-powered suggestions, continuations, and improvements
- **Smart Prompts**: Generate creative writing prompts for various genres
- **Context-Aware**: AI understands your story's tone, style, and content
- **Multiple Modes**: Suggest, continue, summarize, or improve your writing
- **Optional Integration**: App works without AI features if OpenAI key is not provided

### 🎨 UI/UX
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Fully Responsive**: Optimized for mobile (320px+), tablet, and desktop (4K+)
- **Touch-Friendly**: Proper touch targets (44px minimum) for mobile devices
- **Adaptive Layout**: Side panels become bottom sheets on mobile
- **Performance Optimized**: Reduced animations on mobile for better performance
- **Modern Interface**: Clean, distraction-free writing environment

### 🔐 Authentication
- **Email/Password**: Traditional authentication
- **OAuth**: Google and GitHub integration
- **Anonymous Mode**: Guest accounts for quick access
- **Secure**: JWT tokens and encrypted passwords

### 🤖 OpenAI Integration
The app includes optional AI features powered by OpenAI. To enable AI assistance:

1. **Get an OpenAI API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new secret key (starts with `sk-`)

2. **Add to Environment Variables**:
   ```env
   OPENAI_API_KEY="sk-your-api-key-here"
   ```

3. **Deployment Platforms**:
   - **Vercel**: Add to project environment variables
   - **Docker**: Add to `docker.env` file
   - **Local**: Add to `.env.local` file

**Note**: AI features are completely optional. The app functions normally without an OpenAI key, but with reduced AI assistance capabilities.

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: OpenAI API integration
- **Styling**: Tailwind CSS with custom components
- **Animations**: Framer Motion

## 🏗 Architecture

### API Design
The application uses a REST API architecture:

- **REST API**: Next.js API routes handle CRUD operations, authentication, AI features, and chat
- **Shared Types**: TypeScript interfaces ensure consistency across frontend and backend
- **Centralized Config**: Environment-specific configuration for different deployment scenarios

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
   - Database: localhost:5432

### 🛠 Local Development Setup

1. **Clone and setup automatically**
   ```bash
   git clone https://github.com/yourusername/storify.git
   cd storify
   npm run setup
   ```

2. **Start the development server**
   ```bash
   npm run dev
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
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

7. **Verify API Health** (Optional)
   ```bash
   npm run api:health  # Check overall API health
   ```

## 🔧 Troubleshooting

### Common Issues

- **Database errors**: Run `npm run db:setup`
- **Missing dependencies**: Run `npm install`
- **Build errors**: Run `npm run build` to check for TypeScript errors

## 📁 Project Structure

```
storify/
├── app/                    # Next.js app directory
│   ├── api/               # REST API routes
│   │   ├── ai/           # AI-powered features
│   │   ├── auth/         # Authentication
│   │   ├── rooms/        # Collaboration rooms
│   │   ├── stories/      # Story management
│   │   ├── health/       # System health checks
│   │   └── upload/       # File upload
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard page
│   ├── story/            # Story editor pages
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── editor/          # Editor components
│   ├── ui/              # UI components
│   └── ...              # Feature components
├── lib/                 # Utility libraries
│   ├── auth.ts         # Authentication config
│   ├── prisma.ts       # Database client
│   ├── openai.ts       # OpenAI integration
│   ├── api-utils.ts    # API utilities
│   ├── api-config.ts   # API configuration
│   └── utils.ts        # Helper functions
├── types/              # TypeScript type definitions
│   ├── api.ts         # API types
│   └── openai.ts      # OpenAI types
├── prisma/            # Database schema
│   └── schema.prisma  # Prisma schema
└── public/            # Static assets
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
- `POST /api/stories/[id]/chat` - Send chat message

### AI
- `POST /api/ai/assist` - Get AI writing assistance (suggest, continue, summarize, improve)
- `POST /api/ai/prompts` - Generate creative writing prompts

### System & Health
- `GET /api/health` - Comprehensive system health check (API, database)

### Rooms & Collaboration
- `GET /api/rooms` - List available collaboration rooms
- `POST /api/rooms` - Create a new collaboration room
- `GET /api/rooms/[roomId]` - Get room details
- `PATCH /api/rooms/[roomId]` - Update room settings
- `DELETE /api/rooms/[roomId]` - Delete a room

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
