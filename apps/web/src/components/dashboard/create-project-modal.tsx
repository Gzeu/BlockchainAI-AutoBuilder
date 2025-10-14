'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Folder, Globe, Code, Coins, Palette, Users, Gamepad2, Box } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import toast from 'react-hot-toast'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

const PROJECT_TYPES = [
  {
    id: 'WEB3_APP',
    name: 'Web3 Application',
    description: 'Full-stack dApp with frontend and smart contracts',
    icon: <Globe className="w-6 h-6" />,
    color: 'text-blue-600 bg-blue-100',
    popular: true
  },
  {
    id: 'SMART_CONTRACT',
    name: 'Smart Contract',
    description: 'Standalone smart contract for MultiversX',
    icon: <Code className="w-6 h-6" />,
    color: 'text-green-600 bg-green-100'
  },
  {
    id: 'DEFI',
    name: 'DeFi Protocol',
    description: 'Decentralized finance application',
    icon: <Coins className="w-6 h-6" />,
    color: 'text-yellow-600 bg-yellow-100',
    popular: true
  },
  {
    id: 'NFT',
    name: 'NFT Collection',
    description: 'Non-fungible token project with marketplace',
    icon: <Palette className="w-6 h-6" />,
    color: 'text-purple-600 bg-purple-100'
  },
  {
    id: 'DAO',
    name: 'DAO Governance',
    description: 'Decentralized autonomous organization',
    icon: <Users className="w-6 h-6" />,
    color: 'text-pink-600 bg-pink-100'
  },
  {
    id: 'GAME',
    name: 'Blockchain Game',
    description: 'Gaming application with blockchain features',
    icon: <Gamepad2 className="w-6 h-6" />,
    color: 'text-red-600 bg-red-100'
  }
]

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [step, setStep] = useState<'type' | 'details'>('type')
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
    setStep('details')
  }

  const handleBack = () => {
    setStep('type')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    setLoading(true)
    try {
      const project = await apiClient.createProject({
        name: formData.name,
        description: formData.description,
        type: selectedType
      })
      
      toast.success(`Project "${project.name}" created successfully!`)
      onClose()
      
      // Reset form
      setStep('type')
      setSelectedType('')
      setFormData({ name: '', description: '' })
      
      // Refresh page to show new project
      window.location.reload()
    } catch (error) {
      toast.error('Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedProjectType = PROJECT_TYPES.find(type => type.id === selectedType)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {step === 'type' ? 'Create New Project' : `Create ${selectedProjectType?.name}`}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {step === 'type' 
                    ? 'Choose the type of project you want to create'
                    : 'Provide details for your new project'
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {step === 'type' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PROJECT_TYPES.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTypeSelect(type.id)}
                      className="relative p-4 border rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left"
                    >
                      {type.popular && (
                        <div className="absolute top-2 right-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${type.color}`}>
                          {type.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{type.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Selected Type Display */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${selectedProjectType?.color}`}>
                      {selectedProjectType?.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedProjectType?.name}</h3>
                      <p className="text-sm text-gray-600">{selectedProjectType?.description}</p>
                    </div>
                  </div>

                  {/* Project Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter project name"
                    />
                  </div>

                  {/* Project Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe your project (optional)"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div>
                {step === 'details' && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    ← Back to project types
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                {step === 'details' && (
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading || !formData.name.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Folder className="w-4 h-4" />
                        <span>Create Project</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}