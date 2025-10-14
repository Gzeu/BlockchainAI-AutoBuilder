import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'

const router = Router()
const prisma = new PrismaClient()

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Check database connection
    await prisma.$connect()
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
      },
      services: {
        database: 'connected',
        redis: process.env.REDIS_URL ? 'available' : 'not configured',
        ai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
        blockchain: process.env.MULTIVERSX_NETWORK ? 'configured' : 'not configured'
      }
    }
    
    res.status(200).json(health)
  } catch (error) {
    logger.error('Health check failed:', error)
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    })
  } finally {
    await prisma.$disconnect()
  }
})

// Detailed system info (for monitoring)
router.get('/system', async (req, res) => {
  try {
    const system = {
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cpuUsage: process.cpuUsage(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL ? '[CONFIGURED]' : '[NOT SET]',
        REDIS_URL: process.env.REDIS_URL ? '[CONFIGURED]' : '[NOT SET]',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '[CONFIGURED]' : '[NOT SET]'
      }
    }
    
    res.status(200).json(system)
  } catch (error) {
    logger.error('System info failed:', error)
    res.status(500).json({ error: 'Failed to get system information' })
  }
})

export { router as healthRoutes }