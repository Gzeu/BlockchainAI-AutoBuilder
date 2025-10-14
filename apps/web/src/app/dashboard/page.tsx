'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Activity, Zap, TrendingUp, Users } from 'lucide-react'
import { ProjectList } from '@/components/dashboard/project-list'
import { HealthStatusWidget } from '@/components/dashboard/health-status'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { StatsOverview } from '@/components/dashboard/stats-overview'
import { CreateProjectModal } from '@/components/dashboard/create-project-modal'

export default function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken')
    if (!token) {
      window.location.href = '/auth/login'
      return
    }
    
    // Load user data
    // This would normally come from an auth context
    setUser({ name: 'Demo User', email: 'demo@blockchainai.dev' })
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <StatsOverview />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Projects */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <ProjectList limit={6} />
              </div>

              {/* Activity Feed */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <ActivityFeed />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* System Health */}
              <HealthStatusWidget />

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium">Generate Code</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Deploy Contract</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Invite Team</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}