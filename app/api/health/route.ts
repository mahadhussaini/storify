import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const health: any = {
      status: 'ok',
      timestamp: new Date(),
      services: {
        api: 'healthy',
        database: 'unknown'
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      health.services.database = 'healthy'
    } catch (error) {
      console.warn('Database health check failed:', error)
      health.services.database = 'unhealthy'
      health.status = 'degraded'
    }

    // Return appropriate status code
    const statusCode = health.status === 'ok' ? 200 :
                      health.status === 'degraded' ? 206 : 503

    return NextResponse.json(health, { status: statusCode })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
