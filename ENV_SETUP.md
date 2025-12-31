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
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the generated API key (it starts with `sk-`)
6. Set it as `OPENAI_API_KEY` in your environment variables

**Important Notes:**
- Keep your API key secure and never commit it to version control
- The API key is validated automatically - invalid keys will prevent AI features from working
- AI features are optional - the app will work without them but with reduced functionality
- Monitor your OpenAI usage and billing at [OpenAI Usage](https://platform.openai.com/usage)

## Important Notes

- `NEXTAUTH_SECRET` should be a secure random string in production
- `DATABASE_URL` can be changed to PostgreSQL, MySQL, etc. for production
