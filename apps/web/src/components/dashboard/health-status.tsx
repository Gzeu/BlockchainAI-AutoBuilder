'use client'

import { useState, useEffect } from 'react'
import { Activity, Database, Zap, Bot, Blocks } from 'lucide-react'
import { apiClient, HealthStatus } from '@/lib/api-client'

export function HealthStatusWidget() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchHealth = async () => {
    try {
      const data = await apiClient.getHealth()
      setHealth(data)
      setError(null)
    } catch (err) {
      setError('Failed to check system health')
      console.error('Error fetching health:', err)
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (service: string) => {
    const icons = {
      database: Database,
      redis: Zap,
      ai: Bot,
      blockchain: Blocks
    }
    return icons[service as keyof typeof icons] || Activity
  }

  const getServiceStatus = (status: string) => {
    const isHealthy = status === 'connected' || status === 'configured'
    return {
      color: isHealthy ? 'text-green-600' : 'text-yellow-600',
      bg: isHealthy ? 'bg-green-100' : 'bg-yellow-100',
      text: isHealthy ? 'Healthy' : status === 'not configured' ? 'Optional' : 'Issue'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !health) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={fetchHealth}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const overallHealthy = health.status === 'healthy'

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className={`w-5 h-5 ${overallHealthy ? 'text-green-500' : 'text-red-500'}`} />
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          overallHealthy 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {overallHealthy ? 'Healthy' : 'Issues'}
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(health.services).map(([service, status]) => {
          const Icon = getServiceIcon(service)
          const statusInfo = getServiceStatus(status)
          
          return (
            <div key={service} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {service === 'ai' ? 'AI Services' : service}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Uptime</span>
            <div className="font-medium text-gray-900">
              {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
            </div>
          </div>
          <div>
            <span className="text-gray-500">Memory</span>
            <div className="font-medium text-gray-900">
              {health.memory.used}MB / {health.memory.total}MB
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}