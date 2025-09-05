#!/bin/bash

# Storify Docker Development Script

echo "🚀 Starting Storify in development mode with Docker..."

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping Docker services..."
    docker-compose down
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Check if services are already running
if docker-compose ps | grep -q "Up"; then
    echo "🔄 Services are already running. Restarting..."
    docker-compose restart
else
    echo "📦 Starting Docker services..."
    docker-compose up -d

    echo "⏳ Waiting for database to be ready..."
    sleep 5

    # Run migrations if needed
    echo "🗄️ Ensuring database is up to date..."
    docker-compose exec app npx prisma migrate dev --name dev-update 2>/dev/null || echo "Database already up to date"
fi

echo ""
echo "✅ Services started successfully!"
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Socket Server: http://localhost:3001"
echo "🗄️ Database: localhost:5432"
echo ""
echo "📊 Viewing logs... (Press Ctrl+C to stop)"
echo ""

# Show logs
docker-compose logs -f
