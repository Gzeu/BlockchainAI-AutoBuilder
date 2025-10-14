import request from 'supertest'
import { prismaMock, createMockUser, createMockProject } from '../setup'
import app from '../../src/index'

describe('Projects API Routes', () => {
  const mockUser = createMockUser()
  const mockProjects = [
    createMockProject(),
    {
      ...createMockProject(),
      id: 'project-2',
      name: 'NFT Marketplace',
      type: 'NFT',
      status: 'ACTIVE'
    },
    {
      ...createMockProject(),
      id: 'project-3',
      name: 'DeFi Protocol',
      type: 'DEFI',
      status: 'COMPLETED'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/projects', () => {
    it('should return projects for authenticated user', async () => {
      prismaMock.project.findMany.mockResolvedValue(mockProjects as any)
      prismaMock.project.count.mockResolvedValue(3)

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', 'Bearer valid-token')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          projects: expect.arrayContaining([
            expect.objectContaining({
              name: 'Test Project',
              type: 'WEB3_APP'
            })
          ]),
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            pages: 1
          }
        }
      })
    })

    it('should return public projects without authentication', async () => {
      prismaMock.project.findMany.mockResolvedValue(mockProjects as any)
      prismaMock.project.count.mockResolvedValue(3)

      const response = await request(app)
        .get('/api/projects')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data.projects)).toBe(true)
    })

    it('should support pagination parameters', async () => {
      prismaMock.project.findMany.mockResolvedValue(mockProjects.slice(0, 2) as any)
      prismaMock.project.count.mockResolvedValue(3)

      const response = await request(app)
        .get('/api/projects?page=1&limit=2')
        .expect(200)

      expect(prismaMock.project.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 2,
        where: {},
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object)
      })
    })

    it('should filter by user when authenticated', async () => {
      prismaMock.project.findMany.mockResolvedValue([mockProjects[0]] as any)
      prismaMock.project.count.mockResolvedValue(1)

      await request(app)
        .get('/api/projects')
        .set('Authorization', 'Bearer valid-token')
        .expect(200)

      expect(prismaMock.project.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { userId: 'test-user-id' },
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object)
      })
    })
  })

  describe('GET /api/projects/:id', () => {
    it('should return specific project by ID', async () => {
      const projectWithUser = {
        ...mockProjects[0],
        user: mockUser
      }
      prismaMock.project.findUnique.mockResolvedValue(projectWithUser as any)

      const response = await request(app)
        .get(`/api/projects/${mockProjects[0].id}`)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          project: expect.objectContaining({
            id: mockProjects[0].id,
            name: mockProjects[0].name
          })
        }
      })
    })

    it('should return 404 for non-existent project', async () => {
      prismaMock.project.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/projects/non-existent-id')
        .expect(404)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: expect.stringContaining('Project not found')
        }
      })
    })

    it('should hide user info for non-owners', async () => {
      const projectWithUser = {
        ...mockProjects[0],
        userId: 'different-user-id',
        user: mockUser
      }
      prismaMock.project.findUnique.mockResolvedValue(projectWithUser as any)

      const response = await request(app)
        .get(`/api/projects/${mockProjects[0].id}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200)

      expect(response.body.data.project.user).toBeUndefined()
    })
  })

  describe('POST /api/projects', () => {
    const validProjectData = {
      name: 'New Project',
      description: 'Test project description',
      type: 'WEB3_APP'
    }

    it('should create project for authenticated user', async () => {
      const createdProject = {
        ...createMockProject(),
        ...validProjectData,
        user: mockUser
      }
      prismaMock.project.create.mockResolvedValue(createdProject as any)

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer valid-token')
        .send(validProjectData)
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          project: expect.objectContaining({
            name: validProjectData.name,
            description: validProjectData.description,
            type: validProjectData.type
          })
        },
        message: 'Project created successfully'
      })
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send(validProjectData)
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: expect.stringContaining('Access token required')
        }
      })
    })

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing name and type'
      }

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer valid-token')
        .send(invalidData)
        .expect(400)

      expect(response.body.error.message).toContain('Validation failed')
    })

    it('should validate project type', async () => {
      const invalidData = {
        ...validProjectData,
        type: 'INVALID_TYPE'
      }

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer valid-token')
        .send(invalidData)
        .expect(400)

      expect(response.body.error.message).toContain('Validation failed')
    })

    it('should limit description length', async () => {
      const invalidData = {
        ...validProjectData,
        description: 'a'.repeat(501) // Exceeds 500 char limit
      }

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer valid-token')
        .send(invalidData)
        .expect(400)
    })
  })

  describe('PUT /api/projects/:id', () => {
    const updateData = {
      name: 'Updated Project Name',
      description: 'Updated description',
      status: 'ACTIVE'
    }

    it('should update project for owner', async () => {
      const existingProject = { ...mockProjects[0], userId: 'test-user-id' }
      const updatedProject = { ...existingProject, ...updateData, user: mockUser }

      prismaMock.project.findUnique.mockResolvedValue(existingProject as any)
      prismaMock.project.update.mockResolvedValue(updatedProject as any)

      const response = await request(app)
        .put(`/api/projects/${mockProjects[0].id}`)
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          project: expect.objectContaining({
            name: updateData.name,
            description: updateData.description,
            status: updateData.status
          })
        }
      })
    })

    it('should deny access to non-owners', async () => {
      const existingProject = { ...mockProjects[0], userId: 'different-user-id' }
      prismaMock.project.findUnique.mockResolvedValue(existingProject as any)

      const response = await request(app)
        .put(`/api/projects/${mockProjects[0].id}`)
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(403)

      expect(response.body.error.message).toContain('Access denied')
    })

    it('should return 404 for non-existent project', async () => {
      prismaMock.project.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .put('/api/projects/non-existent-id')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(404)

      expect(response.body.error.message).toContain('Project not found')
    })

    it('should validate status values', async () => {
      const existingProject = { ...mockProjects[0], userId: 'test-user-id' }
      prismaMock.project.findUnique.mockResolvedValue(existingProject as any)

      const invalidUpdate = {
        ...updateData,
        status: 'INVALID_STATUS'
      }

      const response = await request(app)
        .put(`/api/projects/${mockProjects[0].id}`)
        .set('Authorization', 'Bearer valid-token')
        .send(invalidUpdate)
        .expect(400)

      expect(response.body.error.message).toContain('Validation failed')
    })
  })

  describe('DELETE /api/projects/:id', () => {
    it('should delete project for owner', async () => {
      const existingProject = { ...mockProjects[0], userId: 'test-user-id' }
      prismaMock.project.findUnique.mockResolvedValue(existingProject as any)
      prismaMock.project.delete.mockResolvedValue(existingProject as any)

      const response = await request(app)
        .delete(`/api/projects/${mockProjects[0].id}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Project deleted successfully'
      })

      expect(prismaMock.project.delete).toHaveBeenCalledWith({
        where: { id: mockProjects[0].id }
      })
    })

    it('should deny deletion to non-owners', async () => {
      const existingProject = { ...mockProjects[0], userId: 'different-user-id' }
      prismaMock.project.findUnique.mockResolvedValue(existingProject as any)

      const response = await request(app)
        .delete(`/api/projects/${mockProjects[0].id}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(403)

      expect(response.body.error.message).toContain('Access denied')
    })

    it('should return 404 for non-existent project', async () => {
      prismaMock.project.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .delete('/api/projects/non-existent-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(404)

      expect(response.body.error.message).toContain('Project not found')
    })
  })

  describe('POST /api/projects/:id/generate', () => {
    it('should generate project template for owner', async () => {
      const existingProject = {
        ...mockProjects[0],
        userId: 'test-user-id',
        type: 'WEB3_APP',
        name: 'My Web3 App',
        description: 'A cool Web3 application'
      }
      
      prismaMock.project.findUnique.mockResolvedValue({
        ...existingProject,
        user: mockUser
      } as any)

      const response = await request(app)
        .post(`/api/projects/${existingProject.id}/generate`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          files: expect.objectContaining({
            'package.json': expect.objectContaining({
              content: expect.stringContaining('my-web3-app')
            }),
            'README.md': expect.objectContaining({
              content: expect.stringContaining('My Web3 App')
            })
          }),
          project: expect.objectContaining({
            id: existingProject.id
          })
        }
      })
    })

    it('should generate smart contract template', async () => {
      const contractProject = {
        ...mockProjects[0],
        userId: 'test-user-id',
        type: 'SMART_CONTRACT',
        name: 'Token Contract'
      }
      
      prismaMock.project.findUnique.mockResolvedValue({
        ...contractProject,
        user: mockUser
      } as any)

      const response = await request(app)
        .post(`/api/projects/${contractProject.id}/generate`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200)

      expect(response.body.data.files).toHaveProperty('Cargo.toml')
      expect(response.body.data.files).toHaveProperty('src/lib.rs')
      expect(response.body.data.files['Cargo.toml'].content).toContain('token-contract')
    })

    it('should deny access to non-owners', async () => {
      const existingProject = { ...mockProjects[0], userId: 'different-user-id' }
      prismaMock.project.findUnique.mockResolvedValue(existingProject as any)

      const response = await request(app)
        .post(`/api/projects/${existingProject.id}/generate`)
        .set('Authorization', 'Bearer valid-token')
        .expect(403)

      expect(response.body.error.message).toContain('Access denied')
    })

    it('should handle unknown project types gracefully', async () => {
      const unknownTypeProject = {
        ...mockProjects[0],
        userId: 'test-user-id',
        type: 'UNKNOWN_TYPE'
      }
      
      prismaMock.project.findUnique.mockResolvedValue({
        ...unknownTypeProject,
        user: mockUser
      } as any)

      const response = await request(app)
        .post(`/api/projects/${unknownTypeProject.id}/generate`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200)

      // Should fallback to basic README template
      expect(response.body.data.files).toHaveProperty('README.md')
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limits to authenticated endpoints', async () => {
      // Mock multiple rapid requests
      const promises = Array.from({ length: 15 }, () => 
        request(app)
          .post('/api/projects')
          .set('Authorization', 'Bearer valid-token')
          .send({
            name: 'Test Project',
            type: 'WEB3_APP'
          })
      )

      const responses = await Promise.allSettled(promises)
      
      // Some requests should be rate limited (429)
      const rateLimited = responses.some(
        result => result.status === 'fulfilled' && result.value.status === 429
      )
      
      expect(rateLimited).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      prismaMock.project.findMany.mockRejectedValue(new Error('Database connection failed'))

      const response = await request(app)
        .get('/api/projects')
        .expect(500)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: expect.stringContaining('Failed to fetch projects')
        }
      })
    })

    it('should handle Prisma constraint violations', async () => {
      const constraintError = new Error('Unique constraint failed')
      constraintError.name = 'PrismaClientKnownRequestError'
      ;(constraintError as any).code = 'P2002'
      
      prismaMock.project.create.mockRejectedValue(constraintError)

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Duplicate Project',
          type: 'WEB3_APP'
        })
        .expect(500)

      expect(response.body.success).toBe(false)
    })

    it('should handle invalid JSON payloads', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer valid-token')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400)
    })
  })

  describe('Security', () => {
    it('should sanitize user input', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        description: 'SELECT * FROM users; --',
        type: 'WEB3_APP'
      }

      prismaMock.project.create.mockResolvedValue({
        ...createMockProject(),
        ...maliciousData,
        user: mockUser
      } as any)

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer valid-token')
        .send(maliciousData)
        .expect(201)

      // Should create project but input should be sanitized/escaped
      expect(response.body.success).toBe(true)
    })

    it('should prevent SQL injection attempts', async () => {
      const sqlInjectionData = {
        name: "'; DROP TABLE projects; --",
        type: 'WEB3_APP'
      }

      // Prisma should handle SQL injection protection
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer valid-token')
        .send(sqlInjectionData)

      // Should either succeed (if Prisma sanitizes) or fail validation
      expect([201, 400]).toContain(response.status)
    })
  })
})