import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { asyncHandler, createError } from '@/middleware/error-handler'
import { authenticateToken, optionalAuth } from '@/middleware/auth'
import { logger } from '@/utils/logger'

const router = Router()
const prisma = new PrismaClient()

// Get all projects (public endpoint with optional auth)
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  try {
    const where = req.user ? { userId: req.user.userId } : {}
    
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        skip,
        take: limit,
        where,
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
          userId: true
        }
      }),
      prisma.project.count({ where })
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

// Get project by ID (public endpoint)
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!project) {
      throw createError('Project not found', 404)
    }

    // Check if user can view this project
    if (project.userId && project.userId !== req.user?.userId) {
      // Remove sensitive information for non-owners
      delete (project as any).user
    }

    res.json({
      success: true,
      data: { project }
    })
  } catch (error) {
    logger.error(`Failed to fetch project ${id}:`, error)
    if (error instanceof Error && error.message === 'Project not found') {
      throw error
    }
    throw createError('Failed to fetch project', 500)
  }
}))

// Create new project (requires auth)
router.post('/',
  authenticateToken,
  [
    body('name').notEmpty().withMessage('Project name is required'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
    body('type').isIn(['WEB3_APP', 'SMART_CONTRACT', 'DAPP', 'DEFI', 'NFT', 'DAO', 'MARKETPLACE', 'GAME', 'OTHER']).withMessage('Valid project type required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400)
    }

    const { name, description, type, config = {} } = req.body
    const userId = req.user!.userId

    try {
      const project = await prisma.project.create({
        data: {
          name,
          description,
          type,
          status: 'DRAFT',
          config,
          userId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      logger.info(`New project created: ${name} (${type}) by ${req.user!.email}`)

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

// Update project (requires auth + ownership)
router.put('/:id',
  authenticateToken,
  [
    body('name').optional().notEmpty().withMessage('Project name cannot be empty'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
    body('status').optional().isIn(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'ERROR']).withMessage('Valid status required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Validation failed', 400)
    }

    const { id } = req.params
    const updateData = req.body
    const userId = req.user!.userId

    try {
      // Check ownership
      const existingProject = await prisma.project.findUnique({
        where: { id },
        select: { userId: true, name: true }
      })

      if (!existingProject) {
        throw createError('Project not found', 404)
      }

      if (existingProject.userId !== userId) {
        throw createError('Access denied', 403)
      }

      const project = await prisma.project.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      logger.info(`Project updated: ${id} by ${req.user!.email}`)

      res.json({
        success: true,
        data: { project },
        message: 'Project updated successfully'
      })
    } catch (error) {
      if (error instanceof Error && (error.message === 'Project not found' || error.message === 'Access denied')) {
        throw error
      }
      logger.error(`Failed to update project ${id}:`, error)
      throw createError('Failed to update project', 500)
    }
  })
)

// Delete project (requires auth + ownership)
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user!.userId

  try {
    // Check ownership
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: { userId: true, name: true }
    })

    if (!existingProject) {
      throw createError('Project not found', 404)
    }

    if (existingProject.userId !== userId) {
      throw createError('Access denied', 403)
    }

    await prisma.project.delete({
      where: { id }
    })

    logger.info(`Project deleted: ${id} by ${req.user!.email}`)

    res.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Project not found' || error.message === 'Access denied')) {
      throw error
    }
    logger.error(`Failed to delete project ${id}:`, error)
    throw createError('Failed to delete project', 500)
  }
}))

// Generate project template (requires auth + ownership)
router.post('/:id/generate', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user!.userId

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!project) {
      throw createError('Project not found', 404)
    }

    if (project.userId !== userId) {
      throw createError('Access denied', 403)
    }

    // This would integrate with AI service to generate project files
    // For now, return a template based on project type
    const templates = {
      WEB3_APP: {
        'package.json': {
          content: JSON.stringify({
            name: project.name.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            description: project.description || '',
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start'
            },
            dependencies: {
              'next': '^15.0.0',
              'react': '^18.2.0',
              '@multiversx/sdk-core': '^13.0.0'
            }
          }, null, 2)
        },
        'README.md': {
          content: `# ${project.name}\n\n${project.description}\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``
        },
        'src/app/page.tsx': {
          content: `export default function HomePage() {\n  return (\n    <div>\n      <h1>${project.name}</h1>\n      <p>${project.description}</p>\n    </div>\n  )\n}`
        }
      },
      SMART_CONTRACT: {
        'Cargo.toml': {
          content: `[package]\nname = "${project.name.toLowerCase().replace(/\s+/g, '-')}"\nversion = "0.1.0"\nedition = "2021"`
        },
        'src/lib.rs': {
          content: `#![no_std]\n\nuse multiversx_sc::imports::*;\n\n#[multiversx_sc::contract]\npub trait ${project.name.replace(/\s+/g, '')}Contract {\n    #[init]\n    fn init(&self) {}\n}`
        }
      }
    }

    const generatedFiles = templates[project.type as keyof typeof templates] || {
      'README.md': { content: `# ${project.name}\n\n${project.description}` }
    }

    logger.info(`Project template generated: ${id} by ${req.user!.email}`)

    res.json({
      success: true,
      data: {
        files: generatedFiles,
        project
      },
      message: 'Project template generated successfully'
    })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Project not found' || error.message === 'Access denied')) {
      throw error
    }
    logger.error(`Failed to generate template for project ${id}:`, error)
    throw createError('Failed to generate project template', 500)
  }
}))

export { router as projectRoutes }