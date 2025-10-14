import request from 'supertest'
import { prismaMock } from '../setup'
import app from '../../src/index'

// Mock OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn()
    }
  }
}

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => mockOpenAI)
})

describe('AI Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set OpenAI API key in environment
    process.env.OPENAI_API_KEY = 'sk-test-key'
  })

  describe('POST /api/ai/generate-code', () => {
    const validGenerateRequest = {
      prompt: 'Create a React component for user profile',
      type: 'component',
      framework: 'react'
    }

    it('should generate code successfully', async () => {
      const mockAIResponse = {
        choices: [{
          message: {
            content: `export function UserProfile() {
  return (
    <div className="user-profile">
      <h2>User Profile</h2>
    </div>
  )
}`
          }
        }],
        usage: {
          total_tokens: 150,
          prompt_tokens: 75,
          completion_tokens: 75
        }
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockAIResponse)

      const response = await request(app)
        .post('/api/ai/generate-code')
        .set('Authorization', 'Bearer valid-token')
        .send(validGenerateRequest)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          code: expect.stringContaining('UserProfile'),
          type: 'component',
          framework: 'react',
          metadata: {
            model: 'gpt-4',
            tokens: 150,
            timestamp: expect.any(String),
            userId: 'test-user-id'
          }
        }
      })

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('React/TypeScript expert')
          },
          {
            role: 'user',
            content: validGenerateRequest.prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/ai/generate-code')
        .send(validGenerateRequest)
        .expect(401)

      expect(response.body.error.message).toContain('Authentication required')
    })

    it('should validate required fields', async () => {
      const invalidRequest = {
        prompt: '', // empty prompt
        type: 'invalid-type' // invalid type
      }

      const response = await request(app)
        .post('/api/ai/generate-code')
        .set('Authorization', 'Bearer valid-token')
        .send(invalidRequest)
        .expect(400)

      expect(response.body.error.message).toContain('Validation failed')
    })

    it('should handle OpenAI API errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('OpenAI API rate limit exceeded')
      )

      const response = await request(app)
        .post('/api/ai/generate-code')
        .set('Authorization', 'Bearer valid-token')
        .send(validGenerateRequest)
        .expect(500)

      expect(response.body.error.message).toContain('Failed to generate code')
    })

    it('should generate smart contract code', async () => {
      const contractRequest = {
        prompt: 'Create a simple token contract',
        type: 'contract',
        framework: 'multiversx'
      }

      const mockContractResponse = {
        choices: [{
          message: {
            content: `#![no_std]

use multiversx_sc::imports::*;

#[multiversx_sc::contract]
pub trait TokenContract {
    #[init]
    fn init(&self) {}
}`
          }
        }],
        usage: { total_tokens: 200 }
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockContractResponse)

      const response = await request(app)
        .post('/api/ai/generate-code')
        .set('Authorization', 'Bearer valid-token')
        .send(contractRequest)
        .expect(200)

      expect(response.body.data.code).toContain('TokenContract')
      expect(response.body.data.type).toBe('contract')
    })
  })

  describe('POST /api/ai/review-code', () => {
    const validReviewRequest = {
      code: 'function add(a, b) { return a + b }',
      language: 'javascript',
      context: 'Simple addition function'
    }

    it('should review code successfully', async () => {
      const mockReviewResponse = {
        choices: [{
          message: {
            content: `Code Review for JavaScript function:

1. Security: Low risk - no user input handling
2. Performance: Optimal for simple addition
3. Quality: Good - clear function purpose
4. Best Practices: Consider TypeScript for better type safety
5. Bugs: None detected
6. Rating: 8/10

Recommendations:
- Add TypeScript types: function add(a: number, b: number): number
- Consider input validation for production use`
          }
        }],
        usage: { total_tokens: 120 }
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockReviewResponse)

      const response = await request(app)
        .post('/api/ai/review-code')
        .set('Authorization', 'Bearer valid-token')
        .send(validReviewRequest)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          review: expect.stringContaining('Code Review'),
          language: 'javascript',
          metadata: {
            model: 'gpt-4',
            tokens: 120,
            userId: 'test-user-id'
          }
        }
      })
    })

    it('should validate supported languages', async () => {
      const invalidRequest = {
        ...validReviewRequest,
        language: 'cobol' // unsupported language
      }

      const response = await request(app)
        .post('/api/ai/review-code')
        .set('Authorization', 'Bearer valid-token')
        .send(invalidRequest)
        .expect(400)

      expect(response.body.error.message).toContain('Validation failed')
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/ai/review-code')
        .send(validReviewRequest)
        .expect(401)
    })
  })

  describe('POST /api/ai/chat', () => {
    const validChatRequest = {
      message: 'How do I create a smart contract on MultiversX?',
      context: 'blockchain-development'
    }

    it('should respond to chat messages', async () => {
      const mockChatResponse = {
        choices: [{
          message: {
            content: 'To create a smart contract on MultiversX, you need to use Rust and the MultiversX SDK...'
          }
        }],
        usage: { total_tokens: 200 }
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockChatResponse)

      const response = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', 'Bearer valid-token')
        .send(validChatRequest)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          response: expect.stringContaining('MultiversX'),
          context: 'blockchain-development',
          metadata: expect.objectContaining({
            tokens: 200
          })
        }
      })
    })

    it('should handle empty messages', async () => {
      const emptyRequest = {
        message: '',
        context: 'general'
      }

      const response = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', 'Bearer valid-token')
        .send(emptyRequest)
        .expect(400)

      expect(response.body.error.message).toContain('Validation failed')
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce AI rate limits per user', async () => {
      // Mock rapid AI requests
      const requests = Array.from({ length: 12 }, () => 
        request(app)
          .post('/api/ai/chat')
          .set('Authorization', 'Bearer valid-token')
          .send({ message: 'Test message' })
      )

      const responses = await Promise.allSettled(requests)
      
      // After 10 requests per minute, should get rate limited
      const rateLimited = responses.some(
        result => result.status === 'fulfilled' && result.value.status === 429
      )
      
      expect(rateLimited).toBe(true)
    })

    it('should track rate limits per IP for unauthenticated requests', async () => {
      // This would test IP-based rate limiting
      const requests = Array.from({ length: 15 }, () => 
        request(app)
          .post('/api/ai/generate-code')
          .send({
            prompt: 'Test prompt',
            type: 'component'
          })
      )

      const responses = await Promise.allSettled(requests)
      
      // All should fail with 401 (unauthorized) before rate limit
      responses.forEach(result => {
        if (result.status === 'fulfilled') {
          expect(result.value.status).toBe(401)
        }
      })
    })
  })

  describe('Service Unavailability', () => {
    it('should handle missing OpenAI API key', async () => {
      delete process.env.OPENAI_API_KEY

      const response = await request(app)
        .post('/api/ai/generate-code')
        .set('Authorization', 'Bearer valid-token')
        .send({
          prompt: 'Test prompt',
          type: 'component'
        })
        .expect(503)

      expect(response.body.error.message).toContain('AI service not configured')
      
      // Restore for other tests
      process.env.OPENAI_API_KEY = 'sk-test-key'
    })
  })
})