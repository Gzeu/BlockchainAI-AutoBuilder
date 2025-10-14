import request from 'supertest'
import app from '../../src/index'
import { PrismaClient } from '@prisma/client'

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    project: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}))

const prisma = new PrismaClient() as any

describe('Projects Routes', () => {
  beforeEach(() => jest.clearAllMocks())

  it('lists projects with pagination', async () => {
    prisma.project.findMany.mockResolvedValue([{ id: 'p1', name: 'Test Project' }])
    prisma.project.count.mockResolvedValue(1)

    const res = await request(app).get('/api/projects?page=1&limit=10').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.projects).toHaveLength(1)
  })

  it('gets project by id', async () => {
    prisma.project.findUnique.mockResolvedValue({ id: 'p1', name: 'Test Project' })
    const res = await request(app).get('/api/projects/p1').expect(200)
    expect(res.body.data.project).toMatchObject({ id: 'p1' })
  })

  it('returns 404 when project missing', async () => {
    prisma.project.findUnique.mockResolvedValue(null)
    await request(app).get('/api/projects/missing').expect(404)
  })

  it('requires auth to create project', async () => {
    await request(app).post('/api/projects').send({ name: 'X', type: 'WEB3_APP' }).expect(401)
  })

  it('creates project for authenticated user', async () => {
    prisma.project.create.mockResolvedValue({ id: 'p2', name: 'X', type: 'WEB3_APP', userId: 'u1' })

    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', 'Bearer token')
      .send({ name: 'X', type: 'WEB3_APP' })
      .expect(201)

    expect(res.body.success).toBe(true)
    expect(res.body.data.project.id).toBe('p2')
  })

  it('updates only owner project', async () => {
    prisma.project.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1' })
    prisma.project.update.mockResolvedValue({ id: 'p1', name: 'New' })

    const res = await request(app)
      .put('/api/projects/p1')
      .set('Authorization', 'Bearer token')
      .send({ name: 'New' })
      .expect(200)

    expect(res.body.success).toBe(true)
  })

  it('deletes project when owner', async () => {
    prisma.project.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1' })
    prisma.project.delete.mockResolvedValue({ id: 'p1' })

    await request(app)
      .delete('/api/projects/p1')
      .set('Authorization', 'Bearer token')
      .expect(200)
  })
})
