'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Code, Zap, Github } from 'lucide-react'
import { WalletButton } from '@/components/wallet-button'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: 'Acasă', href: '/' },
    { name: 'Features', href: '#features' },
    { name: 'Docs', href: '/docs' },
    { name: 'Exemple', href: '/examples' },
  ]

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Zap className="w-2 h-2 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BlockchainAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com/Gzeu/BlockchainAI-AutoBuilder"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm font-medium">GitHub</span>
            </Link>
            
            <WalletButton />
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="https://github.com/Gzeu/BlockchainAI-AutoBuilder"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}