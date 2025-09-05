# Environment Setup

Create a `.env.local` file in the project root with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"

# OAuth Providers (optional - leave empty if not using)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# OpenAI API (optional - for AI features)
OPENAI_API_KEY=""

# Socket.io Server
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
```

## Getting OAuth Keys

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### OpenAI API
1. Go to [OpenAI API](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key to `OPENAI_API_KEY`

## Important Notes

- `NEXTAUTH_SECRET` should be a secure random string in production
- `DATABASE_URL` can be changed to PostgreSQL, MySQL, etc. for production
- The `NEXT_PUBLIC_SOCKET_URL` must be accessible from the browser
- CORS is configured to allow localhost origins by default
