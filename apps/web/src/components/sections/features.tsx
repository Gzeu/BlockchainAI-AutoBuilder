'use client'

import { motion } from 'framer-motion'
import { 
  Code2, 
  Zap, 
  Shield, 
  Layers, 
  Bot, 
  Rocket,
  Database,
  GitBranch,
  Smartphone,
  Globe,
  Lock,
  TrendingUp
} from 'lucide-react'

const features = [
  {
    icon: Code2,
    title: 'Next.js 15 + TypeScript',
    description: 'App Router, Server Components, și cele mai noi features pentru performanță maximă.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Zap,
    title: 'MultiversX Integration',
    description: 'SDK complet pentru smart contracts, wallet connect și transacții blockchain.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Bot,
    title: 'AI Automation',
    description: 'Code generation, PR reviews și optimizări automate cu OpenAI și Claude.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: GitBranch,
    title: 'CI/CD Complet',
    description: 'GitHub Actions cu testing, linting, security audit și deployment automat.',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Shield,
    title: 'Security First',
    description: 'CodeQL analysis, dependency scanning și best practices integrate.',
    color: 'from-red-500 to-red-600'
  },
  {
    icon: Layers,
    title: 'Monorepo Structure',
    description: 'Organizare profesională cu Turborepo pentru scalabilitate maximă.',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    icon: Database,
    title: 'Database Ready',
    description: 'Prisma ORM cu PostgreSQL, migrations și seed-uri automate.',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    icon: Rocket,
    title: 'Deploy în 1-Click',
    description: 'Vercel pentru frontend, Railway pentru backend, totul automatizat.',
    color: 'from-pink-500 to-pink-600'
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Responsive design cu Tailwind CSS și suport pentru PWA.',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    icon: Globe,
    title: 'Multi-chain Support',
    description: 'Ready pentru extindere pe Ethereum, Polygon și alte rețele.',
    color: 'from-teal-500 to-teal-600'
  },
  {
    icon: Lock,
    title: 'Auth Integration',
    description: 'NextAuth.js cu suport pentru wallet login și social providers.',
    color: 'from-violet-500 to-violet-600'
  },
  {
    icon: TrendingUp,
    title: 'Analytics Built-in',
    description: 'PostHog, Sentry și monitoring pentru insights și performance.',
    color: 'from-emerald-500 to-emerald-600'
  }
]

export function Features() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Totul de care ai nevoie pentru 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}succes
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            O platformă completă cu cele mai bune practici și tehnologii moderne
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}