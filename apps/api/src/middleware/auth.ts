import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createError } from '@/middleware/error-handler'
import { logger } from '@/utils/logger'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        email: string
      }
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    throw createError('Access token required', 401)
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    }
    
    logger.debug(`Authenticated user: ${req.user.email}`)
    next()
  } catch (error) {
    logger.warn(`Invalid token: ${token.substring(0, 20)}...`)
    throw createError('Invalid or expired token', 403)
  }
}

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is provided, but doesn't require it
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    }
    logger.debug(`Optional auth - user: ${req.user.email}`)
  } catch (error) {
    logger.debug('Optional auth - invalid token, continuing without user')
  }

  next()
}

/**
 * Admin Only Middleware
 * Requires authentication and admin role
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw createError('Authentication required', 401)
  }

  // In a real app, you'd check admin role from database
  // For demo, we'll use a simple email check
  const adminEmails = [
    'admin@blockchainai.dev',
    'pricopgeorge@gmail.com'
  ]

  if (!adminEmails.includes(req.user.email)) {
    throw createError('Admin access required', 403)
  }

  next()
}

/**
 * Rate Limiting for AI Endpoints
 */
export const aiRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // In a real app, implement sophisticated rate limiting
  // For demo, we'll do simple request counting
  const userKey = req.user?.userId || req.ip
  
  // Simple in-memory rate limiting (use Redis in production)
  const rateLimitStore = new Map()
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 10

  const userRequests = rateLimitStore.get(userKey) || []
  const validRequests = userRequests.filter((timestamp: number) => now - timestamp < windowMs)

  if (validRequests.length >= maxRequests) {
    throw createError('AI rate limit exceeded. Try again later.', 429)
  }

  validRequests.push(now)
  rateLimitStore.set(userKey, validRequests)

  logger.debug(`AI rate limit - user: ${userKey}, requests: ${validRequests.length}/${maxRequests}`)
  next()
}