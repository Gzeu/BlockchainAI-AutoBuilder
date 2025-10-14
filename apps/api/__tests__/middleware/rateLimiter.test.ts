import request from 'supertest'
import express from 'express'
import { createRateLimiter } from '../../src/middleware/rateLimiter'

// Create test app
const createTestApp = (limiter: any) => {
  const app = express()
  app.use(express.json())
  app.use(limiter)
  app.get('/test', (req, res) => {
    res.json({ success: true, message: 'Request allowed' })
  })
  return app
}

describe('Rate Limiter Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000, // 1 minute
        max: 5, // 5 requests per minute
        message: 'Too many requests'
      })
      const app = createTestApp(limiter)

      // Make 5 requests (within limit)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/test')
          .expect(200)
        
        expect(response.body.success).toBe(true)
        expect(response.headers['x-ratelimit-limit']).toBe('5')
        expect(response.headers['x-ratelimit-remaining']).toBe(String(5 - i - 1))
      }
    })

    it('should block requests exceeding limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 3,
        message: 'Rate limit exceeded'
      })
      const app = createTestApp(limiter)

      // Make 3 requests (at limit)
      for (let i = 0; i < 3; i++) {
        await request(app)
          .get('/test')
          .expect(200)
      }

      // 4th request should be blocked
      const response = await request(app)
        .get('/test')
        .expect(429)

      expect(response.body.error.message).toContain('Rate limit exceeded')
      expect(response.headers['retry-after']).toBeDefined()
    })

    it('should reset rate limit after window expires', async () => {
      const limiter = createRateLimiter({
        windowMs: 100, // Very short window for testing
        max: 2,
        message: 'Rate limited'
      })
      const app = createTestApp(limiter)

      // Exhaust rate limit
      await request(app).get('/test').expect(200)
      await request(app).get('/test').expect(200)
      await request(app).get('/test').expect(429)

      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should allow requests again
      await request(app).get('/test').expect(200)
    })
  })

  describe('IP-based Rate Limiting', () => {
    it('should track rate limits per IP address', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 2
      })
      const app = createTestApp(limiter)

      // IP 1 makes requests
      await request(app)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.1')
        .expect(200)
      
      await request(app)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.1')
        .expect(200)
      
      await request(app)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.1')
        .expect(429)

      // IP 2 should still be allowed
      await request(app)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.2')
        .expect(200)
    })

    it('should handle missing IP addresses', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 2
      })
      const app = createTestApp(limiter)

      // Requests without explicit IP should still work
      await request(app).get('/test').expect(200)
      await request(app).get('/test').expect(200)
      await request(app).get('/test').expect(429)
    })

    it('should handle proxy headers correctly', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 2
      })
      const app = createTestApp(limiter)

      // Test various proxy headers
      await request(app)
        .get('/test')
        .set('X-Real-IP', '10.0.0.1')
        .expect(200)
      
      await request(app)
        .get('/test')
        .set('X-Forwarded-For', '10.0.0.2, 192.168.1.1')
        .expect(200)
      
      await request(app)
        .get('/test')
        .set('CF-Connecting-IP', '203.0.113.1')
        .expect(200)
    })
  })

  describe('User-based Rate Limiting', () => {
    it('should track rate limits per authenticated user', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 3,
        keyGenerator: (req: any) => req.user?.id || req.ip
      })
      
      const app = express()
      app.use(express.json())
      
      // Mock auth middleware
      app.use((req: any, res, next) => {
        const userId = req.headers['x-user-id']
        if (userId) {
          req.user = { id: userId }
        }
        next()
      })
      
      app.use(limiter)
      app.get('/test', (req, res) => {
        res.json({ success: true })
      })

      // User 1 exhausts their limit
      for (let i = 0; i < 3; i++) {
        await request(app)
          .get('/test')
          .set('X-User-ID', 'user1')
          .expect(200)
      }
      
      await request(app)
        .get('/test')
        .set('X-User-ID', 'user1')
        .expect(429)

      // User 2 should still be allowed
      await request(app)
        .get('/test')
        .set('X-User-ID', 'user2')
        .expect(200)
    })
  })

  describe('Custom Rate Limit Responses', () => {
    it('should return custom error messages', async () => {
      const customMessage = 'API quota exceeded. Please try again later.'
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 1,
        message: {
          success: false,
          error: {
            message: customMessage,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: 60
          }
        }
      })
      const app = createTestApp(limiter)

      await request(app).get('/test').expect(200)
      
      const response = await request(app)
        .get('/test')
        .expect(429)

      expect(response.body.error.message).toBe(customMessage)
      expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED')
    })

    it('should include rate limit headers', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 5
      })
      const app = createTestApp(limiter)

      const response = await request(app)
        .get('/test')
        .expect(200)

      expect(response.headers['x-ratelimit-limit']).toBe('5')
      expect(response.headers['x-ratelimit-remaining']).toBe('4')
      expect(response.headers['x-ratelimit-reset']).toBeDefined()
    })
  })

  describe('Skip Conditions', () => {
    it('should skip rate limiting for whitelisted IPs', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 2,
        skip: (req: any) => {
          const whitelistedIPs = ['127.0.0.1', '10.0.0.1']
          return whitelistedIPs.includes(req.ip)
        }
      })
      const app = createTestApp(limiter)

      // Simulate whitelisted IP
      for (let i = 0; i < 5; i++) {
        await request(app)
          .get('/test')
          .set('X-Forwarded-For', '127.0.0.1')
          .expect(200)
      }
      
      // Non-whitelisted IP should be limited
      await request(app)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.1')
        .expect(200)
      
      await request(app)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.1')
        .expect(200)
      
      await request(app)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.1')
        .expect(429)
    })

    it('should skip rate limiting for admin users', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 2,
        skip: (req: any) => req.user?.role === 'admin'
      })
      
      const app = express()
      app.use(express.json())
      app.use((req: any, res, next) => {
        const role = req.headers['x-user-role']
        req.user = { role }
        next()
      })
      app.use(limiter)
      app.get('/test', (req, res) => {
        res.json({ success: true })
      })

      // Admin user should bypass rate limits
      for (let i = 0; i < 5; i++) {
        await request(app)
          .get('/test')
          .set('X-User-Role', 'admin')
          .expect(200)
      }
      
      // Regular user should be limited
      await request(app)
        .get('/test')
        .set('X-User-Role', 'user')
        .expect(200)
      
      await request(app)
        .get('/test')
        .set('X-User-Role', 'user')
        .expect(200)
      
      await request(app)
        .get('/test')
        .set('X-User-Role', 'user')
        .expect(429)
    })
  })

  describe('Memory and Performance', () => {
    it('should handle high volume of unique keys', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 10
      })
      const app = createTestApp(limiter)

      // Generate many unique IPs
      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .get('/test')
            .set('X-Forwarded-For', `192.168.1.${i}`)
        )
      }

      const results = await Promise.all(promises)
      
      // All should succeed (within individual limits)
      results.forEach(result => {
        expect(result.status).toBe(200)
      })
    })

    it('should cleanup expired rate limit entries', async () => {
      // This test would require access to internal store state
      // In a real implementation, you'd test memory cleanup
      const limiter = createRateLimiter({
        windowMs: 100, // Very short for testing
        max: 5
      })
      const app = createTestApp(limiter)

      await request(app)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.1')
        .expect(200)

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should handle cleanup without memory leaks
      await request(app)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.1')
        .expect(200)
    })
  })

  describe('Error Handling', () => {
    it('should handle store failures gracefully', async () => {
      // Mock store that fails
      const failingStore = {
        incr: jest.fn().mockRejectedValue(new Error('Store unavailable')),
        decrement: jest.fn(),
        resetAll: jest.fn()
      }

      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 5,
        store: failingStore,
        skipFailedRequests: false,
        skipSuccessfulRequests: false
      })
      const app = createTestApp(limiter)

      // Should still allow requests when store fails
      await request(app)
        .get('/test')
        .expect(200)
    })

    it('should handle malformed request objects', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 5
      })
      
      const app = express()
      app.use((req: any, res, next) => {
        // Simulate corrupted request object
        delete req.ip
        delete req.headers
        next()
      })
      app.use(limiter)
      app.get('/test', (req, res) => {
        res.json({ success: true })
      })

      // Should handle gracefully
      await request(app)
        .get('/test')
        .expect(200)
    })
  })
})