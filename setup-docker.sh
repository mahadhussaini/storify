#!/bin/bash

# Storify Docker Setup Script

echo "🚀 Setting up Storify with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "📦 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🗄️ Running database migrations..."
docker-compose exec app npx prisma migrate dev --name init

echo "🔧 Generating Prisma client..."
docker-compose exec app npx prisma generate

echo "✅ Setup complete!"
echo ""
echo "🌐 Application is running at: http://localhost:3000"
echo "📡 Socket server is running at: http://localhost:3001"
echo "🗄️ Database is running at: localhost:5432"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart: docker-compose restart"
echo "  Access database: docker-compose exec db psql -U storify_user -d storify"
echo "  Access app shell: docker-compose exec app sh"
