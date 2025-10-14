import Link from 'next/link'
import { Github, Twitter, Mail, Code } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BlockchainAI AutoBuilder
              </span>
            </Link>
            <p className="text-gray-600 mb-4 max-w-md">
              Platforma de automatizare pentru dezvoltarea aplicațiilor blockchain și AI. 
              Construită cu Next.js 15, TypeScript și MultiversX SDK.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/Gzeu/BlockchainAI-AutoBuilder"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href="mailto:pricopgeorge@gmail.com"
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Resurse</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Documentație
                </Link>
              </li>
              <li>
                <Link href="/examples" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Exemple
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Template-uri
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Comunitate</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contributing" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Contribuie
                </Link>
              </li>
              <li>
                <Link href="/issues" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Issues
                </Link>
              </li>
              <li>
                <Link href="/discussions" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Discussions
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2025 George Pricop. Licențiat sub MIT License.
          </p>
          <p className="text-gray-500 text-sm mt-2 md:mt-0">
            Construit cu ❤️ în București pentru comunitatea Web3
          </p>
        </div>
      </div>
    </footer>
  )
}