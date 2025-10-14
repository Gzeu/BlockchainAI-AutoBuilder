import { Router } from 'express'
import OpenAI from 'openai'
import { body, validationResult } from 'express-validator'
import { asyncHandler, createError } from '@/middleware/error-handler'
import { logger } from '@/utils/logger'

const router = Router()

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

// Generate code endpoint
router.post('/generate-code',
  [
    body('prompt').notEmpty().withMessage('Prompt is required'),
    body('type').isIn(['component', 'contract', 'api', 'test']).withMessage('Valid type is required')
  ],
  asyncHandler(async (req, res) => {
    if (!openai) {
      throw createError('AI service not configured', 503)
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400)
    }

    const { prompt, type, framework = 'react' } = req.body

    try {
      const systemPrompts = {
        component: `You are a React/TypeScript expert. Generate a modern, well-structured React component using TypeScript, Tailwind CSS, and best practices. Include proper types, error handling, and accessibility.`,
        contract: `You are a MultiversX smart contract expert. Generate a Rust smart contract using the MultiversX framework. Include proper error handling, events, and security best practices.`,
        api: `You are a Node.js/Express expert. Generate a RESTful API endpoint using TypeScript, Express, and Prisma ORM. Include proper validation, error handling, and documentation.`,
        test: `You are a testing expert. Generate comprehensive unit tests using Jest and Testing Library. Include edge cases, mocks, and proper assertions.`
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompts[type as keyof typeof systemPrompts]
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })

      const generatedCode = completion.choices[0].message.content

      logger.info(`AI code generated for type: ${type}, prompt: ${prompt.substring(0, 50)}...`)

      res.json({
        success: true,
        data: {
          code: generatedCode,
          type,
          framework,
          metadata: {
            model: 'gpt-4',
            tokens: completion.usage?.total_tokens,
            timestamp: new Date().toISOString()
          }
        }
      })
    } catch (error) {
      logger.error('AI code generation failed:', error)
      throw createError('Failed to generate code', 500)
    }
  })
)

// Code review endpoint
router.post('/review-code',
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('language').isIn(['typescript', 'rust', 'javascript']).withMessage('Valid language is required')
  ],
  asyncHandler(async (req, res) => {
    if (!openai) {
      throw createError('AI service not configured', 503)
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400)
    }

    const { code, language, context = '' } = req.body

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a senior code reviewer. Analyze the provided ${language} code and provide:
1. Security issues and vulnerabilities
2. Performance optimizations
3. Code quality improvements
4. Best practices violations
5. Bug fixes
6. Overall rating (1-10)

Be specific and provide actionable feedback with examples.`
          },
          {
            role: 'user',
            content: `Context: ${context}\n\nCode to review:\n\`\`\`${language}\n${code}\n\`\`\``
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      })

      const review = completion.choices[0].message.content

      logger.info(`AI code review completed for ${language} code`)

      res.json({
        success: true,
        data: {
          review,
          language,
          metadata: {
            model: 'gpt-4',
            tokens: completion.usage?.total_tokens,
            timestamp: new Date().toISOString()
          }
        }
      })
    } catch (error) {
      logger.error('AI code review failed:', error)
      throw createError('Failed to review code', 500)
    }
  })
)

// Optimize code endpoint
router.post('/optimize-code',
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('language').isIn(['typescript', 'rust', 'javascript']).withMessage('Valid language is required')
  ],
  asyncHandler(async (req, res) => {
    if (!openai) {
      throw createError('AI service not configured', 503)
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400)
    }

    const { code, language, goals = ['performance', 'readability'] } = req.body

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a code optimization expert. Optimize the provided ${language} code focusing on: ${goals.join(', ')}. 

Provide:
1. Optimized code
2. Explanation of changes
3. Performance improvements
4. Maintainability improvements

Maintain the original functionality while improving the specified aspects.`
          },
          {
            role: 'user',
            content: `\`\`\`${language}\n${code}\n\`\`\``
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })

      const optimization = completion.choices[0].message.content

      logger.info(`AI code optimization completed for ${language} code`)

      res.json({
        success: true,
        data: {
          optimization,
          language,
          goals,
          metadata: {
            model: 'gpt-4',
            tokens: completion.usage?.total_tokens,
            timestamp: new Date().toISOString()
          }
        }
      })
    } catch (error) {
      logger.error('AI code optimization failed:', error)
      throw createError('Failed to optimize code', 500)
    }
  })
)

// Chat endpoint for general assistance
router.post('/chat',
  [
    body('message').notEmpty().withMessage('Message is required')
  ],
  asyncHandler(async (req, res) => {
    if (!openai) {
      throw createError('AI service not configured', 503)
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400)
    }

    const { message, context = 'general' } = req.body

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant for the BlockchainAI AutoBuilder platform. You help developers with:
- Next.js and React development
- TypeScript programming
- MultiversX blockchain integration
- Smart contract development
- Web3 technologies
- DevOps and CI/CD

Provide accurate, helpful, and concise responses.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })

      const response = completion.choices[0].message.content

      logger.info(`AI chat response provided for context: ${context}`)

      res.json({
        success: true,
        data: {
          response,
          context,
          metadata: {
            model: 'gpt-4',
            tokens: completion.usage?.total_tokens,
            timestamp: new Date().toISOString()
          }
        }
      })
    } catch (error) {
      logger.error('AI chat failed:', error)
      throw createError('Failed to get AI response', 500)
    }
  })
)

export { router as aiRoutes }