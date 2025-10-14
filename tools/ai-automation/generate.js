#!/usr/bin/env node

const { program } = require('commander')
const fs = require('fs').promises
const path = require('path')
const OpenAI = require('openai')

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

program
  .name('ai-generate')
  .description('AI-powered code generation tool')
  .version('0.1.0')

program
  .command('component')
  .description('Generate a React component')
  .argument('<name>', 'Component name')
  .option('-d, --description <desc>', 'Component description')
  .option('-o, --output <path>', 'Output directory', './src/components')
  .action(async (name, options) => {
    if (!openai) {
      console.error('❌ OpenAI API key not configured. Set OPENAI_API_KEY environment variable.')
      process.exit(1)
    }

    try {
      console.log(`🤖 Generating React component: ${name}...`)
      
      const prompt = `Create a modern React component named "${name}" using TypeScript and Tailwind CSS.
      ${options.description ? `Description: ${options.description}` : ''}
      
      Requirements:
      - Use TypeScript with proper types
      - Use Tailwind CSS for styling
      - Include proper JSDoc comments
      - Follow React best practices
      - Make it responsive and accessible
      - Export as named export
      
      Only return the component code without explanations.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      })

      const code = completion.choices[0].message.content
      const filename = `${name}.tsx`
      const outputPath = path.join(options.output, filename)
      
      // Ensure output directory exists
      await fs.mkdir(options.output, { recursive: true })
      
      // Write component file
      await fs.writeFile(outputPath, code, 'utf8')
      
      console.log(`✅ Component generated: ${outputPath}`)
      console.log(`📊 Tokens used: ${completion.usage?.total_tokens || 'unknown'}`)
      
    } catch (error) {
      console.error('❌ Error generating component:', error.message)
      process.exit(1)
    }
  })

program
  .command('contract')
  .description('Generate a MultiversX smart contract')
  .argument('<name>', 'Contract name')
  .option('-d, --description <desc>', 'Contract description')
  .option('-o, --output <path>', 'Output directory', './src/contracts')
  .action(async (name, options) => {
    if (!openai) {
      console.error('❌ OpenAI API key not configured.')
      process.exit(1)
    }

    try {
      console.log(`🤖 Generating smart contract: ${name}...`)
      
      const prompt = `Create a MultiversX smart contract named "${name}" using Rust.
      ${options.description ? `Description: ${options.description}` : ''}
      
      Requirements:
      - Use MultiversX SC framework
      - Include proper error handling
      - Add events for important actions
      - Include view functions
      - Follow security best practices
      - Add comprehensive comments
      
      Only return the contract code without explanations.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.5
      })

      const code = completion.choices[0].message.content
      const filename = `${name.toLowerCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '')}.rs`
      const outputPath = path.join(options.output, filename)
      
      await fs.mkdir(options.output, { recursive: true })
      await fs.writeFile(outputPath, code, 'utf8')
      
      console.log(`✅ Contract generated: ${outputPath}`)
      console.log(`📊 Tokens used: ${completion.usage?.total_tokens || 'unknown'}`)
      
    } catch (error) {
      console.error('❌ Error generating contract:', error.message)
      process.exit(1)
    }
  })

program
  .command('api')
  .description('Generate API endpoint')
  .argument('<name>', 'Endpoint name')
  .option('-m, --method <method>', 'HTTP method', 'GET')
  .option('-d, --description <desc>', 'Endpoint description')
  .option('-o, --output <path>', 'Output directory', './src/routes')
  .action(async (name, options) => {
    if (!openai) {
      console.error('❌ OpenAI API key not configured.')
      process.exit(1)
    }

    try {
      console.log(`🤖 Generating API endpoint: ${options.method} /${name}...`)
      
      const prompt = `Create an Express.js API endpoint for "${name}" using TypeScript.
      ${options.description ? `Description: ${options.description}` : ''}
      Method: ${options.method}
      
      Requirements:
      - Use Express Router
      - Include input validation with express-validator
      - Add proper error handling
      - Use async/await pattern
      - Include JSDoc comments
      - Follow REST API best practices
      - Add rate limiting considerations
      
      Only return the route handler code without explanations.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.5
      })

      const code = completion.choices[0].message.content
      const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.ts`
      const outputPath = path.join(options.output, filename)
      
      await fs.mkdir(options.output, { recursive: true })
      await fs.writeFile(outputPath, code, 'utf8')
      
      console.log(`✅ API endpoint generated: ${outputPath}`)
      console.log(`📊 Tokens used: ${completion.usage?.total_tokens || 'unknown'}`)
      
    } catch (error) {
      console.error('❌ Error generating API endpoint:', error.message)
      process.exit(1)
    }
  })

if (process.argv.length < 3) {
  program.help()
}

program.parse()