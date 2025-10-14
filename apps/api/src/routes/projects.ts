import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { asyncHandler, createError } from '@/middleware/error-handler'
import { logger } from '@/utils/logger'

const router = Router()
const prisma = new PrismaClient()

// Get all projects
router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  try {
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          // userId: true - Add when auth is implemented
        }
      }),
      prisma.project.count()
    ])

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    logger.error('Failed to fetch projects:', error)
    throw createError('Failed to fetch projects', 500)
  }
}))

// Get project by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        // Add relations when models are implemented
      }
    })

    if (!project) {
      throw createError('Project not found', 404)
    }

    res.json({
      success: true,
      data: { project }
    })
  } catch (error) {
    logger.error(`Failed to fetch project ${id}:`, error)
    throw createError('Failed to fetch project', 500)
  }
}))

// Create new project
router.post('/',
  [
    body('name').notEmpty().withMessage('Project name is required'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
    body('type').isIn(['web3-app', 'smart-contract', 'dapp', 'defi', 'nft']).withMessage('Valid project type required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400)
    }

    const { name, description, type, config = {} } = req.body
    // TODO: Get userId from authentication middleware
    const userId = 'placeholder-user-id'

    try {
      const project = await prisma.project.create({
        data: {
          name,
          description,
          type,
          status: 'DRAFT',
          config,
          // userId - Add when auth is implemented
        }
      })

      logger.info(`New project created: ${name} (${type})`)

      res.status(201).json({
        success: true,
        data: { project },
        message: 'Project created successfully'
      })
    } catch (error) {
      logger.error('Failed to create project:', error)
      throw createError('Failed to create project', 500)
    }
  })
)

// Update project
router.put('/:id',
  [
    body('name').optional().notEmpty().withMessage('Project name cannot be empty'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
    body('status').optional().isIn(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).withMessage('Valid status required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400)
    }

    const { id } = req.params
    const updateData = req.body

    try {
      const project = await prisma.project.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      })

      logger.info(`Project updated: ${id}`)

      res.json({
        success: true,
        data: { project },
        message: 'Project updated successfully'
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw createError('Project not found', 404)
      }
      logger.error(`Failed to update project ${id}:`, error)
      throw createError('Failed to update project', 500)
    }
  })
)

// Delete project
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params

  try {
    await prisma.project.delete({
      where: { id }
    })

    logger.info(`Project deleted: ${id}`)

    res.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    if (error.code === 'P2025') {
      throw createError('Project not found', 404)
    }
    logger.error(`Failed to delete project ${id}:`, error)
    throw createError('Failed to delete project', 500)
  }
}))

// Generate project template
router.post('/:id/generate', asyncHandler(async (req, res) => {
  const { id } = req.params

  try {
    const project = await prisma.project.findUnique({
      where: { id }
    })

    if (!project) {
      throw createError('Project not found', 404)
    }

    // This would integrate with AI service to generate project files
    // Placeholder implementation
    const generatedFiles = {
      'package.json': { content: '{}' },
      'README.md': { content: `# ${project.name}\n\n${project.description}` },
      'src/index.ts': { content: '// Generated project entry point' }
    }

    logger.info(`Project template generated: ${id}`)

    res.json({
      success: true,
      data: {
        files: generatedFiles,
        project
      },
      message: 'Project template generated successfully'
    })
  } catch (error) {
    logger.error(`Failed to generate template for project ${id}:`, error)
    throw createError('Failed to generate project template', 500)
  }
}))

export { router as projectRoutes }