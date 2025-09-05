-- Initial database setup for Storify
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist
-- (Note: This is handled by the POSTGRES_DB environment variable in docker-compose.yml)

-- You can add any additional database initialization here
-- For example, creating indexes or setting up extensions

-- Enable UUID extension for better performance with Prisma
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- You can add any custom database functions or configurations here
