'use client'

import { useState, useEffect } from 'react'
import { Clock, GitCommit, Zap, Code, Rocket, User } from 'lucide-react'
import { motion } from 'framer-motion'

interface Activity {
  id: string
  type: 'project_created' | 'code_generated' | 'contract_deployed' | 'user_registered'
  message: string
  timestamp: string
  user?: string
  metadata?: any
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading activities
    setTimeout(() => {
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'project_created',
          message: 'Created new project "DeFi Trading Bot"',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          user: 'Demo User'
        },
        {
          id: '2',
          type: 'code_generated',
          message: 'Generated React component for wallet connection',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          user: 'Demo User'
        },
        {
          id: '3',
          type: 'contract_deployed',
          message: 'Deployed smart contract to devnet',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          user: 'Demo User'
        },
        {
          id: '4',
          type: 'project_created',
          message: 'Created new project "NFT Marketplace"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          user: 'Demo User'
        },
        {
          id: '5',
          type: 'user_registered',
          message: 'Welcome to BlockchainAI AutoBuilder!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          user: 'Demo User'
        }
      ]
      setActivities(mockActivities)
      setLoading(false)
    }, 1000)
  }, [])

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'project_created':
        return <GitCommit className="w-4 h-4" />
      case 'code_generated':
        return <Code className="w-4 h-4" />
      case 'contract_deployed':
        return <Rocket className="w-4 h-4" />
      case 'user_registered':
        return <User className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'project_created':
        return 'text-blue-600 bg-blue-100'
      case 'code_generated':
        return 'text-green-600 bg-green-100'
      case 'contract_deployed':
        return 'text-purple-600 bg-purple-100'
      case 'user_registered':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400 mt-1">Your actions will appear here</p>
        </div>
      ) : (
        activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.message}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {activity.user && (
                  <span className="text-xs text-gray-500">
                    by {activity.user}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            </div>
          </motion.div>
        ))
      )}
      
      {activities.length > 0 && (
        <div className="text-center pt-4">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all activity
          </button>
        </div>
      )}
    </div>
  )
}