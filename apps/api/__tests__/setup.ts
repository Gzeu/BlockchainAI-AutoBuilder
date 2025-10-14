import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockDeep<PrismaClient>()),
}))

export const prismaMock = new PrismaClient() as unknown as DeepMockProxy<PrismaClient>

// Mock external services
jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'Mocked AI response'
              }
            }],
            usage: {
              total_tokens: 100,
              prompt_tokens: 50,
              completion_tokens: 50
            }
          })
        }
      }
    }))
  }
})

// Mock MultiversX SDK
jest.mock('@multiversx/sdk-core', () => ({
  ApiNetworkProvider: jest.fn().mockImplementation(() => ({
    getNetworkConfig: jest.fn().mockResolvedValue({
      chainId: 'D',
      gasPrice: 1000000000,
      minGasPrice: 1000000000
    }),
    getAccount: jest.fn().mockResolvedValue({
      address: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqhllllsqg94ah',
      nonce: 0,
      balance: '1000000000000000000'
    }),
    sendTransaction: jest.fn().mockResolvedValue({
      hash: 'mock-tx-hash'
    })
  })),
  Address: {
    fromBech32: jest.fn().mockImplementation((addr) => ({ bech32: () => addr })),
    newFromBech32: jest.fn().mockImplementation((addr) => ({ bech32: () => addr }))
  },
  Transaction: jest.fn().mockImplementation(() => ({
    setNonce: jest.fn(),
    setValue: jest.fn(),
    setReceiver: jest.fn(),
    setGasLimit: jest.fn(),
    setData: jest.fn(),
    getHash: jest.fn().mockReturnValue({ toString: () => 'mock-hash' })
  })),
  TransactionWatcher: jest.fn().mockImplementation(() => ({
    awaitCompleted: jest.fn().mockResolvedValue({
      status: 'success',
      contractResults: []
    })
  }))
}))

// Mock Winston logger
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis()
  }
}))

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 'mock-user-id', email: 'test@example.com' })
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}))

// Global test setup
beforeEach(() => {
  mockReset(prismaMock)
})

// Environment variables for tests
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.OPENAI_API_KEY = 'sk-test-key'
process.env.MULTIVERSX_NETWORK = 'devnet'
process.env.MULTIVERSX_GATEWAY_URL = 'https://devnet-gateway.multiversx.com'
process.env.MULTIVERSX_API_URL = 'https://devnet-api.multiversx.com'

// Test utilities
export const createMockUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date()
})

export const createMockProject = () => ({
  id: 'test-project-id',
  name: 'Test Project',
  description: 'Test project description',
  type: 'WEB3_APP',
  status: 'DRAFT',
  config: {},
  userId: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date()
})

export const createMockRequest = (overrides = {}) => ({
  user: {
    userId: 'test-user-id',
    email: 'test@example.com'
  },
  headers: {
    authorization: 'Bearer mock-jwt-token'
  },
  body: {},
  params: {},
  query: {},
  ...overrides
})

export const createMockResponse = () => {
  const res = {} as any
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  res.cookie = jest.fn().mockReturnValue(res)
  res.clearCookie = jest.fn().mockReturnValue(res)
  return res
}

// Custom matchers
expect.extend({
  toBeValidEgldAddress(received) {
    const pass = typeof received === 'string' && 
                 received.startsWith('erd1') && 
                 received.length === 62
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid EGLD address`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be a valid EGLD address`,
        pass: false,
      }
    }
  },
})