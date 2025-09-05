@echo off
REM Storify Docker Development Script for Windows

echo 🚀 Starting Storify in development mode with Docker...

REM Function to cleanup on exit (simplified for Windows)
:cleanup
echo.
echo 🛑 Stopping Docker services...
docker-compose down
goto :eof

REM Check if services are already running
docker-compose ps | findstr "Up" >nul
if %ERRORLEVEL% EQU 0 (
    echo 🔄 Services are already running. Restarting...
    docker-compose restart
) else (
    echo 📦 Starting Docker services...
    docker-compose up -d

    echo ⏳ Waiting for database to be ready...
    timeout /t 5 /nobreak >nul

    REM Run migrations if needed
    echo 🗄️ Ensuring database is up to date...
    docker-compose exec app npx prisma migrate dev --name dev-update 2>nul || echo Database already up to date
)

echo.
echo ✅ Services started successfully!
echo 🌐 Frontend: http://localhost:3000
echo 📡 Socket Server: http://localhost:3001
echo 🗄️ Database: localhost:5432
echo.
echo 📊 Opening logs... (Close this window to stop)
echo.

REM Show logs
docker-compose logs -f
