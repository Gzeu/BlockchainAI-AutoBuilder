'use client'

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: {
    message: string
    details?: any
  }
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface HealthStatus {
  status: string
  timestamp: string
  uptime: number
  version: string
  environment: string
  memory: {
    used: number
    total: number
  }
  services: {
    database: string
    redis: string
    ai: string
    blockchain: string
  }
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response
      },
      (error) => {
        const message = error.response?.data?.error?.message || error.message || 'An error occurred'
        
        // Don't show toast for 401/403 errors (handled by auth logic)
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          toast.error(message)
        }
        
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.client.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      email,
      password,
    })
    return response.data.data
  }

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.client.post<ApiResponse<{ user: User; token: string }>>('/auth/register', {
      name,
      email,
      password,
    })
    return response.data.data
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/auth/profile')
    return response.data.data
  }

  // Health endpoint
  async getHealth(): Promise<HealthStatus> {
    const response = await this.client.get<ApiResponse<HealthStatus>>('/health')
    return response.data.data
  }

  // Projects endpoints
  async getProjects(page = 1, limit = 10): Promise<{ projects: Project[]; pagination: any }> {
    const response = await this.client.get<ApiResponse<{ projects: Project[]; pagination: any }>>(
      `/projects?page=${page}&limit=${limit}`
    )
    return response.data.data
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.client.get<ApiResponse<{ project: Project }>>(`/projects/${id}`)
    return response.data.data.project
  }

  async createProject(data: {
    name: string
    description?: string
    type: string
    config?: any
  }): Promise<Project> {
    const response = await this.client.post<ApiResponse<{ project: Project }>>('/projects', data)
    return response.data.data.project
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await this.client.put<ApiResponse<{ project: Project }>>(`/projects/${id}`, data)
    return response.data.data.project
  }

  async deleteProject(id: string): Promise<void> {
    await this.client.delete(`/projects/${id}`)
  }

  // AI endpoints
  async generateCode(data: {
    prompt: string
    type: 'component' | 'contract' | 'api' | 'test'
    framework?: string
  }): Promise<{ code: string; type: string; metadata: any }> {
    const response = await this.client.post<ApiResponse<{ code: string; type: string; metadata: any }>>(
      '/ai/generate-code',
      data
    )
    return response.data.data
  }

  async reviewCode(data: {
    code: string
    language: string
    context?: string
  }): Promise<{ review: string; metadata: any }> {
    const response = await this.client.post<ApiResponse<{ review: string; metadata: any }>>(
      '/ai/review-code',
      data
    )
    return response.data.data
  }

  async chatWithAI(message: string, context = 'general'): Promise<{ response: string; metadata: any }> {
    const response = await this.client.post<ApiResponse<{ response: string; metadata: any }>>('/ai/chat', {
      message,
      context,
    })
    return response.data.data
  }

  // Blockchain endpoints
  async getNetworkInfo(): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>('/blockchain/info')
    return response.data.data
  }

  async getAccountInfo(address: string): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>(`/blockchain/account/${address}`)
    return response.data.data
  }
}

// Create singleton instance
export const apiClient = new ApiClient()
export default apiClient