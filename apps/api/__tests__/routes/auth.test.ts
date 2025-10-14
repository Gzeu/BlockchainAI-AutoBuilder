import request from 'supertest'
import app from '../../src/index'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}))

const prisma = new PrismaClient() as any
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const mockJwt = jwt as jest.Mocked<typeof jwt>

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })

  describe('POST /api/auth/register', () => {
    it('registers a new user', async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      mockBcrypt.hash.mockResolvedValue('hashed' as never)
      prisma.user.create.mockResolvedValue({ id: 'u1', email: 'john@example.com', name: 'John' })
      mockJwt.sign.mockReturnValue('token' as never)

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'John', email: 'john@example.com', password: 'password123' })
        .expect(201)

      expect(res.body.success).toBe(true)
      expect(res.body.data.user).toMatchObject({ id: 'u1', email: 'john@example.com', name: 'John' })
      expect(res.body.data.token).toBe('token')
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12)
      expect(mockJwt.sign).toHaveBeenCalled()
    })

    it('rejects if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' })

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'John', email: 'john@example.com', password: 'password123' })
        .expect(409)

      expect(res.body.success).toBe(false)
    })

    it('validates required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'bad', password: '123' })
        .expect(400)

      expect(res.body.success).toBe(false)
    })
  })

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'john@example.com', name: 'John', password: 'hashed' })
      mockBcrypt.compare.mockResolvedValue(true as never)
      mockJwt.sign.mockReturnValue('token' as never)

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'john@example.com', password: 'password123' })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.user).toMatchObject({ id: 'u1', email: 'john@example.com', name: 'John' })
      expect(res.body.data.token).toBe('token')
    })

    it('rejects invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'john@example.com', password: 'password123' })
        .expect(401)
    })

    it('rejects invalid password', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'john@example.com', name: 'John', password: 'hashed' })
      mockBcrypt.compare.mockResolvedValue(false as never)
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'john@example.com', password: 'wrong' })
        .expect(401)
    })

    it('validates body', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'bad', password: '' })
        .expect(400)
    })
  })
})
