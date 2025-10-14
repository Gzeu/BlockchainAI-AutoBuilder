import { Request, Response, NextFunction } from 'express'

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      statusCode: 404
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/login',
      'GET /api/blockchain/info',
      'POST /api/ai/generate',
      'GET /api/projects'
    ]
  })
}