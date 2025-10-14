'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const technologies = [
  { name: 'Next.js 15', logo: '/logos/nextjs.svg', category: 'Frontend' },
  { name: 'TypeScript', logo: '/logos/typescript.svg', category: 'Language' },
  { name: 'Tailwind CSS', logo: '/logos/tailwind.svg', category: 'Styling' },
  { name: 'MultiversX', logo: '/logos/multiversx.svg', category: 'Blockchain' },
  { name: 'Prisma', logo: '/logos/prisma.svg', category: 'Database' },
  { name: 'PostgreSQL', logo: '/logos/postgresql.svg', category: 'Database' },
  { name: 'OpenAI', logo: '/logos/openai.svg', category: 'AI' },
  { name: 'GitHub Actions', logo: '/logos/github.svg', category: 'CI/CD' },
  { name: 'Vercel', logo: '/logos/vercel.svg', category: 'Deploy' },
  { name: 'Railway', logo: '/logos/railway.svg', category: 'Deploy' },
  { name: 'Supabase', logo: '/logos/supabase.svg', category: 'Backend' },
  { name: 'Docker', logo: '/logos/docker.svg', category: 'DevOps' }
]

const categories = {
  'Frontend': 'from-blue-500 to-blue-600',
  'Language': 'from-green-500 to-green-600',
  'Styling': 'from-purple-500 to-purple-600',
  'Blockchain': 'from-yellow-500 to-yellow-600',
  'Database': 'from-red-500 to-red-600',
  'AI': 'from-pink-500 to-pink-600',
  'CI/CD': 'from-indigo-500 to-indigo-600',
  'Deploy': 'from-cyan-500 to-cyan-600',
  'Backend': 'from-teal-500 to-teal-600',
  'DevOps': 'from-orange-500 to-orange-600'
}

export function TechStack() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Tech Stack 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Modern
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Tehnologii de varf și tools industry-standard pentru dezvoltarea profesională
          </motion.p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                {/* Placeholder for logo - în producție ar trebui să fie imagini reale */}
                <div className={`w-8 h-8 rounded bg-gradient-to-r ${categories[tech.category as keyof typeof categories] || 'from-gray-400 to-gray-500'}`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                {tech.name}
              </h3>
              <span className={`inline-block px-2 py-1 text-xs rounded-full bg-gradient-to-r ${categories[tech.category as keyof typeof categories]} text-white`}>
                {tech.category}
              </span>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-6 py-3 rounded-full text-sm font-medium border border-blue-200">
            <span>✨ Și multe altele configurate automat!</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}