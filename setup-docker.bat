@echo off
REM Storify Docker Setup Script for Windows

echo 🚀 Setting up Storify with Docker...

REM Check if Docker is installed
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo 📦 Building Docker images...
docker-compose build

echo 🚀 Starting services...
docker-compose up -d

echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo 🗄️ Running database migrations...
docker-compose exec app npx prisma migrate dev --name init

echo 🔧 Generating Prisma client...
docker-compose exec app npx prisma generate

echo ✅ Setup complete!
echo.
echo 🌐 Application is running at: http://localhost:3000
echo 📡 Socket server is running at: http://localhost:3001
echo 🗄️ Database is running at: localhost:5432
echo.
echo Useful commands:
echo   View logs: docker-compose logs -f
echo   Stop services: docker-compose down
echo   Restart: docker-compose restart
echo   Access database: docker-compose exec db psql -U storify_user -d storify
echo   Access app shell: docker-compose exec app sh
echo.
pause
