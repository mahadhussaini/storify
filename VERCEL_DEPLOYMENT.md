# 🚀 Vercel Deployment Guide

This guide will help you deploy Storify to Vercel with a cloud database.

## Prerequisites

- [Vercel Account](https://vercel.com)
- [Supabase Account](https://supabase.com) (for free PostgreSQL database)
- [Vercel CLI](https://vercel.com/cli) installed
- Git repository

## Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
# Linux/Mac
./deploy-vercel.sh

# Windows
deploy-vercel.bat
```

### Option 2: Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Deploy to Vercel**
   ```bash
   npm run vercel:deploy
   ```

## Database Setup

Since Vercel doesn't provide persistent databases in the free tier, you'll need to set up a cloud database:

### Option 1: Supabase (Free)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for setup to complete

2. **Get Database URL**
   - Go to Settings → Database
   - Copy the connection string
   - It should look like: `postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres`

3. **Set Environment Variables in Vercel**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add: `DATABASE_URL` with your Supabase connection string

### Option 2: PlanetScale (Free)

1. **Create PlanetScale Database**
   - Go to [planetscale.com](https://planetscale.com)
   - Create a new database
   - Get the connection string

2. **Set Environment Variables**
   - Add `DATABASE_URL` in Vercel with your PlanetScale connection string

## Environment Variables

Set these in your Vercel project settings:

### Required
```env
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here
```

### Optional (for enhanced features)
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_SOCKET_URL=wss://your-socket-server.com
```

## Database Migration

After setting up the database, run the migrations:

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Run database migrations
npx prisma db push

# Generate Prisma client
npx prisma generate
```

## Socket.io Setup (Optional)

For real-time features, you'll need a Socket.io server. Here are your options:

### Option 1: Vercel Serverless Functions
- Socket.io works with Vercel's serverless functions
- Set `NEXT_PUBLIC_SOCKET_URL` to your Vercel domain

### Option 2: Cloud Socket.io Service
- Use services like [Socket.io Cloud](https://socketio.cloud) or [Pusher](https://pusher.com)
- Set the service URL as `NEXT_PUBLIC_SOCKET_URL`

### Option 3: Railway/Fly.io Deployment
- Deploy the Socket.io server separately
- Use the deployment URL as `NEXT_PUBLIC_SOCKET_URL`

## OAuth Setup (Optional)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-app-name.vercel.app/api/auth/callback/google`
6. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel

### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `https://your-app-name.vercel.app/api/auth/callback/github`
4. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in Vercel

## AI Features (Optional)

To enable AI-powered writing assistance:

1. Get an OpenAI API key from [OpenAI](https://platform.openai.com)
2. Set `OPENAI_API_KEY` in Vercel environment variables
3. The AI features will automatically work

## Deployment Verification

After deployment, verify everything works:

1. **Visit your Vercel URL**
2. **Test user registration/login**
3. **Create a story and test real-time editing**
4. **Check database connectivity**

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection locally
vercel env pull .env.local
npx prisma db push
```

### Build Errors
```bash
# Check Vercel build logs
vercel logs
```

### Environment Variables
```bash
# Check environment variables
npm run vercel:env
```

## Cost Estimation

### Free Tier
- **Vercel**: 100GB bandwidth, 1000 deployments/month
- **Supabase**: 500MB database, 50MB file storage
- **OpenAI**: Pay per token (if using AI features)

### Paid Upgrades
- **Vercel Pro**: $20/month for higher limits
- **Supabase Pro**: $25/month for more storage
- **OpenAI**: Usage-based pricing

## Next Steps

1. **Custom Domain**: Add a custom domain in Vercel
2. **Analytics**: Set up Vercel Analytics
3. **Monitoring**: Configure error tracking (Sentry, LogRocket)
4. **CDN**: Images and assets are automatically optimized
5. **Performance**: Monitor Core Web Vitals in Vercel dashboard

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
