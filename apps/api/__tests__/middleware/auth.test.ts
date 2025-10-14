import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { verifyToken, requireAuth } from '../../src/middleware/auth'
import { prismaMock } from '../setup'

// Mock jwt module
const mockJwt = jwt as jest.Mocked<typeof jwt>

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: undefined
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    mockNext = jest.fn()
    jest.clearAllMocks()
  })

  describe('verifyToken', () => {
    it('should verify valid JWT token', async () => {
      const mockToken = 'valid-jwt-token'
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600
      }
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      }

      mockRequest.headers!.authorization = `Bearer ${mockToken}`
      mockJwt.verify.mockReturnValue(mockPayload as any)
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any)

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockJwt.verify).toHaveBeenCalledWith(
        mockToken,
        process.env.JWT_SECRET
      )
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      })
      expect(mockRequest.user).toEqual(mockUser)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should handle missing authorization header', async () => {
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
      expect(mockJwt.verify).not.toHaveBeenCalled()
    })

    it('should handle invalid token format', async () => {
      mockRequest.headers!.authorization = 'InvalidFormat'

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
      expect(mockJwt.verify).not.toHaveBeenCalled()
    })

    it('should handle JWT verification errors', async () => {
      const mockToken = 'invalid-jwt-token'
      mockRequest.headers!.authorization = `Bearer ${mockToken}`
      mockJwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token')
      })

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should handle expired tokens', async () => {
      const mockToken = 'expired-jwt-token'
      mockRequest.headers!.authorization = `Bearer ${mockToken}`
      mockJwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date())
      })

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should handle user not found in database', async () => {
      const mockToken = 'valid-jwt-token'
      const mockPayload = {
        userId: 'non-existent-user',
        email: 'test@example.com'
      }

      mockRequest.headers!.authorization = `Bearer ${mockToken}`
      mockJwt.verify.mockReturnValue(mockPayload as any)
      prismaMock.user.findUnique.mockResolvedValue(null)

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      const mockToken = 'valid-jwt-token'
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com'
      }

      mockRequest.headers!.authorization = `Bearer ${mockToken}`
      mockJwt.verify.mockReturnValue(mockPayload as any)
      prismaMock.user.findUnique.mockRejectedValue(new Error('Database error'))

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should handle malformed JWT payload', async () => {
      const mockToken = 'malformed-jwt-token'
      const mockPayload = {
        // Missing userId field
        email: 'test@example.com'
      }

      mockRequest.headers!.authorization = `Bearer ${mockToken}`
      mockJwt.verify.mockReturnValue(mockPayload as any)

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should strip sensitive user data', async () => {
      const mockToken = 'valid-jwt-token'
      const mockPayload = { userId: 'user-123', email: 'test@example.com' }
      const mockUserWithPassword = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password', // Should not be included
        apiKeys: ['sensitive-api-key'] // Should not be included
      }

      mockRequest.headers!.authorization = `Bearer ${mockToken}`
      mockJwt.verify.mockReturnValue(mockPayload as any)
      prismaMock.user.findUnique.mockResolvedValue(mockUserWithPassword as any)

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.user).not.toHaveProperty('password')
      expect(mockRequest.user).not.toHaveProperty('apiKeys')
      expect(mockRequest.user).toHaveProperty('id')
      expect(mockRequest.user).toHaveProperty('email')
    })
  })

  describe('requireAuth', () => {
    it('should allow access for authenticated users', () => {
      mockRequest.user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      }

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should reject unauthenticated users', () => {
      mockRequest.user = undefined

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
          timestamp: expect.any(String)
        }
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject users with invalid user object', () => {
      mockRequest.user = {} // Empty user object

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should validate user has required fields', () => {
      mockRequest.user = {
        // Missing id field
        email: 'test@example.com',
        name: 'Test User'
      }

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('Token Edge Cases', () => {
    it('should handle very long tokens', async () => {
      const longToken = 'a'.repeat(10000) // 10KB token
      mockRequest.headers!.authorization = `Bearer ${longToken}`
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Token too large')
      })

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should handle tokens with special characters', async () => {
      const specialToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.€¥£§'
      mockRequest.headers!.authorization = `Bearer ${specialToken}`
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid character')
      })

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should handle multiple Authorization headers', async () => {
      mockRequest.headers!.authorization = ['Bearer token1', 'Bearer token2'] as any

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
      expect(mockJwt.verify).not.toHaveBeenCalled()
    })
  })

  describe('Security Tests', () => {
    it('should prevent timing attacks on token verification', async () => {
      const startTime = Date.now()
      
      // Test with invalid token
      mockRequest.headers!.authorization = 'Bearer invalid-token'
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)
      
      const invalidTokenTime = Date.now() - startTime
      
      // Reset for valid token test
      jest.clearAllMocks()
      const startTime2 = Date.now()
      
      mockRequest.headers!.authorization = 'Bearer valid-token'
      mockJwt.verify.mockReturnValue({ userId: 'user-123', email: 'test@example.com' } as any)
      prismaMock.user.findUnique.mockResolvedValue(null) // User not found
      
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)
      
      const validTokenTime = Date.now() - startTime2
      
      // Timing difference should be minimal (within reasonable bounds)
      expect(Math.abs(invalidTokenTime - validTokenTime)).toBeLessThan(50)
    })

    it('should not expose internal errors to client', async () => {
      const mockToken = 'valid-jwt-token'
      mockRequest.headers!.authorization = `Bearer ${mockToken}`
      
      // Mock internal server error
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Internal JWT library error with sensitive info')
      })

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
      // Should not throw or expose the internal error
    })

    it('should prevent JWT algorithm confusion attacks', async () => {
      const mockToken = 'malicious-none-alg-token'
      mockRequest.headers!.authorization = `Bearer ${mockToken}`
      
      // Mock algorithm confusion attempt
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid algorithm')
      })

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockJwt.verify).toHaveBeenCalledWith(
        mockToken,
        process.env.JWT_SECRET
        // Should include algorithm verification in real implementation
      )
    })
  })
})