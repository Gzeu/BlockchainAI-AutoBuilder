'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FolderOpen, 
  Zap, 
  TrendingUp, 
  Clock, 
  Code, 
  Rocket,
  Activity,
  Users
} from 'lucide-react'

interface Stat {
  name: string
  value: string
  change: string
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  color: string
}

export function StatsOverview() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading stats from API
    setTimeout(() => {
      const mockStats: Stat[] = [
        {
          name: 'Total Projects',
          value: '12',
          change: '+2 this week',
          changeType: 'increase',
          icon: <FolderOpen className="w-6 h-6" />,
          color: 'text-blue-600 bg-blue-100'
        },
        {
          name: 'AI Generations',
          value: '147',
          change: '+23 today',
          changeType: 'increase',
          icon: <Zap className="w-6 h-6" />,
          color: 'text-yellow-600 bg-yellow-100'
        },
        {
          name: 'Code Lines',
          value: '8.9k',
          change: '+1.2k this week',
          changeType: 'increase',
          icon: <Code className="w-6 h-6" />,
          color: 'text-green-600 bg-green-100'
        },
        {
          name: 'Deployments',
          value: '24',
          change: '+5 this month',
          changeType: 'increase',
          icon: <Rocket className="w-6 h-6" />,
          color: 'text-purple-600 bg-purple-100'
        }
      ]
      setStats(mockStats)
      setLoading(false)
    }, 800)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-24 mt-2"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <div className="flex items-center mt-2">
                <span
                  className={`text-xs font-medium ${
                    stat.changeType === 'increase'
                      ? 'text-green-600'
                      : stat.changeType === 'decrease'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {stat.changeType === 'increase' && '↗'}
                  {stat.changeType === 'decrease' && '↘'}
                  {stat.change}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-full ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}