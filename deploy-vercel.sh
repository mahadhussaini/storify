#!/bin/bash

# Storify Vercel Deployment Script

echo "🚀 Deploying Storify to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "Install it with: npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "📋 Linking to Vercel project..."
vercel link

echo "🌍 Setting up environment variables..."
echo "Please set the following environment variables in your Vercel dashboard:"
echo ""
echo "Required:"
echo "  DATABASE_URL=postgresql://username:password@host:port/database"
echo "  NEXTAUTH_URL=https://your-app-name.vercel.app"
echo "  NEXTAUTH_SECRET=your-super-secret-key-here"
echo ""
echo "Optional:"
echo "  GOOGLE_CLIENT_ID=your-google-client-id"
echo "  GOOGLE_CLIENT_SECRET=your-google-client-secret"
echo "  GITHUB_CLIENT_ID=your-github-client-id"
echo "  GITHUB_CLIENT_SECRET=your-github-client-secret"
echo "  OPENAI_API_KEY=your-openai-api-key"
echo "  NEXT_PUBLIC_SOCKET_URL=wss://your-socket-server.com"
echo ""
read -p "Press Enter after setting up environment variables..."

echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set up a PostgreSQL database (Supabase, PlanetScale, or Railway)"
echo "2. Update DATABASE_URL in Vercel environment variables"
echo "3. Run database migrations: vercel env pull .env.local && npx prisma db push"
echo "4. Set up Socket.io server (optional, for real-time features)"
echo "5. Configure OAuth providers (optional)"
