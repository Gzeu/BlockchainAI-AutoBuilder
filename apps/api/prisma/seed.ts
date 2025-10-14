import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@blockchainai.dev' },
    update: {},
    create: {
      email: 'demo@blockchainai.dev',
      name: 'Demo User',
      password: hashedPassword,
      bio: 'Demo user for BlockchainAI AutoBuilder',
      location: 'Bucharest, Romania',
      preferences: {
        theme: 'dark',
        notifications: true,
        aiAssistance: true
      }
    }
  })

  console.log('👤 Created demo user:', demoUser.email)

  // Create sample projects
  const sampleProjects = [
    {
      name: 'DeFi Trading Bot',
      description: 'Automated trading bot for MultiversX DeFi protocols',
      type: 'DEFI',
      status: 'ACTIVE',
      config: {
        framework: 'next.js',
        blockchain: 'multiversx',
        features: ['trading', 'analytics', 'notifications']
      },
      aiGenerated: true
    },
    {
      name: 'NFT Marketplace',
      description: 'Decentralized marketplace for digital collectibles',
      type: 'NFT',
      status: 'DRAFT',
      config: {
        framework: 'react',
        blockchain: 'multiversx',
        features: ['minting', 'trading', 'auctions']
      },
      aiGenerated: false
    },
    {
      name: 'Staking Platform',
      description: 'Liquid staking protocol with rewards',
      type: 'DEFI',
      status: 'COMPLETED',
      config: {
        framework: 'vue.js',
        blockchain: 'multiversx',
        features: ['staking', 'rewards', 'governance']
      },
      aiGenerated: true
    }
  ]

  for (const projectData of sampleProjects) {
    const project = await prisma.project.create({
      data: {
        ...projectData,
        userId: demoUser.id,
        type: projectData.type as any,
        status: projectData.status as any
      }
    })
    
    console.log('📁 Created project:', project.name)
    
    // Add sample files to projects
    if (project.name === 'DeFi Trading Bot') {
      await prisma.projectFile.createMany({
        data: [
          {
            projectId: project.id,
            filename: 'package.json',
            path: '/package.json',
            content: JSON.stringify({
              name: 'defi-trading-bot',
              version: '1.0.0',
              dependencies: {
                '@multiversx/sdk-core': '^13.0.0',
                'next': '^15.0.0'
              }
            }, null, 2),
            language: 'json'
          },
          {
            projectId: project.id,
            filename: 'TradingBot.tsx',
            path: '/src/components/TradingBot.tsx',
            content: `import { useState, useEffect } from 'react'

export function TradingBot() {
  const [isActive, setIsActive] = useState(false)
  
  return (
    <div className="trading-bot">
      <h2>DeFi Trading Bot</h2>
      <button onClick={() => setIsActive(!isActive)}>
        {isActive ? 'Stop' : 'Start'} Bot
      </button>
    </div>
  )
}`,
            language: 'typescript',
            generatedByAi: true,
            aiPrompt: 'Create a React component for a DeFi trading bot interface'
          }
        ]
      })
    }
  }

  // Create sample templates
  const templates = [
    {
      name: 'Next.js Web3 Starter',
      description: 'Complete Next.js template with MultiversX integration',
      category: 'FULLSTACK',
      config: {
        framework: 'next.js',
        styling: 'tailwind',
        features: ['wallet-connect', 'smart-contracts', 'responsive']
      },
      files: {
        'package.json': { dependencies: { 'next': '^15.0.0' } },
        'src/app/page.tsx': { content: 'export default function Home() { return <div>Hello Web3!</div> }' }
      },
      author: 'BlockchainAI Team',
      tags: ['nextjs', 'web3', 'multiversx', 'starter'],
      featured: true
    },
    {
      name: 'Smart Contract Template',
      description: 'MultiversX smart contract boilerplate in Rust',
      category: 'SMART_CONTRACT',
      config: {
        language: 'rust',
        framework: 'multiversx-sc',
        features: ['access-control', 'events', 'storage']
      },
      files: {
        'Cargo.toml': { content: '[package]\nname = "my-contract"' },
        'src/lib.rs': { content: '#![no_std]\n\nuse multiversx_sc::imports::*;' }
      },
      author: 'BlockchainAI Team',
      tags: ['rust', 'smart-contract', 'multiversx'],
      featured: true
    }
  ]

  for (const templateData of templates) {
    const template = await prisma.template.create({
      data: {
        ...templateData,
        category: templateData.category as any
      }
    })
    
    console.log('📋 Created template:', template.name)
  }

  // Create sample AI requests
  await prisma.aiRequest.create({
    data: {
      type: 'CODE_GENERATION',
      prompt: 'Create a React component for wallet connection',
      response: 'export function WalletConnect() { /* component code */ }',
      status: 'COMPLETED',
      tokensUsed: 150,
      model: 'gpt-4',
      userId: demoUser.id,
      context: {
        framework: 'react',
        language: 'typescript'
      }
    }
  })

  console.log('🤖 Created sample AI request')

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })