#!/usr/bin/env node

const { program } = require('commander')
const fs = require('fs').promises
const path = require('path')
const OpenAI = require('openai')
const { execSync } = require('child_process')

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

program
  .name('ai-review')
  .description('AI-powered code review tool')
  .version('0.1.0')

program
  .command('file')
  .description('Review a specific file')
  .argument('<filepath>', 'Path to file to review')
  .option('-o, --output <path>', 'Output review to file')
  .action(async (filepath, options) => {
    if (!openai) {
      console.error('❌ OpenAI API key not configured.')
      process.exit(1)
    }

    try {
      console.log(`🔍 Reviewing file: ${filepath}...`)
      
      const code = await fs.readFile(filepath, 'utf8')
      const ext = path.extname(filepath)
      const language = getLanguageFromExtension(ext)
      
      const prompt = `Please review this ${language} code file and provide detailed feedback:

\`\`\`${language}
${code}
\`\`\`

Provide feedback on:
1. 🔒 Security issues and vulnerabilities
2. 🚀 Performance optimizations
3. 📚 Code quality and readability
4. ✅ Best practices compliance
5. 🐛 Potential bugs
6. 📖 Documentation improvements
7. 🧪 Testing suggestions
8. ⭐ Overall rating (1-10)

Be specific and provide actionable recommendations with code examples where helpful.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.3
      })

      const review = completion.choices[0].message.content
      
      if (options.output) {
        await fs.writeFile(options.output, review, 'utf8')
        console.log(`✅ Review saved to: ${options.output}`)
      } else {
        console.log('\n' + '='.repeat(80))
        console.log('📋 CODE REVIEW RESULTS')
        console.log('='.repeat(80))
        console.log(review)
        console.log('='.repeat(80))
      }
      
      console.log(`📊 Tokens used: ${completion.usage?.total_tokens || 'unknown'}`)
      
    } catch (error) {
      console.error('❌ Error reviewing file:', error.message)
      process.exit(1)
    }
  })

program
  .command('diff')
  .description('Review git diff changes')
  .option('-b, --branch <branch>', 'Compare against branch', 'main')
  .option('-o, --output <path>', 'Output review to file')
  .action(async (options) => {
    if (!openai) {
      console.error('❌ OpenAI API key not configured.')
      process.exit(1)
    }

    try {
      console.log(`🔍 Reviewing git diff against ${options.branch}...`)
      
      // Get git diff
      const diff = execSync(`git diff ${options.branch}...HEAD`, { encoding: 'utf8' })
      
      if (!diff.trim()) {
        console.log('ℹ️  No changes detected.')
        return
      }
      
      const prompt = `Please review these git diff changes and provide feedback:

\`\`\`diff
${diff}
\`\`\`

Focus on:
1. 🔒 Security implications of changes
2. 🐛 Potential bugs introduced
3. 💡 Code quality improvements
4. 🏗️  Architecture concerns
5. 🧪 Testing coverage needs
6. 📖 Documentation updates needed
7. ⚡ Performance impact
8. ✅ Overall assessment

Provide specific, actionable feedback for each significant change.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.3
      })

      const review = completion.choices[0].message.content
      
      if (options.output) {
        await fs.writeFile(options.output, review, 'utf8')
        console.log(`✅ Review saved to: ${options.output}`)
      } else {
        console.log('\n' + '='.repeat(80))
        console.log('📋 GIT DIFF REVIEW RESULTS')
        console.log('='.repeat(80))
        console.log(review)
        console.log('='.repeat(80))
      }
      
      console.log(`📊 Tokens used: ${completion.usage?.total_tokens || 'unknown'}`)
      
    } catch (error) {
      console.error('❌ Error reviewing diff:', error.message)
      process.exit(1)
    }
  })

program
  .command('project')
  .description('Review entire project structure')
  .option('-d, --directory <path>', 'Project directory', '.')
  .option('-o, --output <path>', 'Output review to file')
  .action(async (options) => {
    if (!openai) {
      console.error('❌ OpenAI API key not configured.')
      process.exit(1)
    }

    try {
      console.log(`🔍 Reviewing project structure in: ${options.directory}...`)
      
      // Get project structure
      const structure = execSync(`find ${options.directory} -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.rs" | head -20`, { encoding: 'utf8' })
      
      const prompt = `Please review this project structure and provide architectural feedback:

Project files:
${structure}

Provide feedback on:
1. 🏗️  Overall architecture and organization
2. 📁 File and folder structure
3. 🔄 Dependencies and coupling
4. 📚 Naming conventions
5. 🚀 Scalability considerations
6. 🛡️  Security architecture
7. 🧪 Testing structure
8. 📖 Documentation needs
9. ✅ Best practices compliance
10. 💡 Improvement recommendations

Provide specific, actionable recommendations for improvement.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.3
      })

      const review = completion.choices[0].message.content
      
      if (options.output) {
        await fs.writeFile(options.output, review, 'utf8')
        console.log(`✅ Review saved to: ${options.output}`)
      } else {
        console.log('\n' + '='.repeat(80))
        console.log('📋 PROJECT REVIEW RESULTS')
        console.log('='.repeat(80))
        console.log(review)
        console.log('='.repeat(80))
      }
      
      console.log(`📊 Tokens used: ${completion.usage?.total_tokens || 'unknown'}`)
      
    } catch (error) {
      console.error('❌ Error reviewing project:', error.message)
      process.exit(1)
    }
  })

function getLanguageFromExtension(ext) {
  const extensions = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.rs': 'rust',
    '.py': 'python',
    '.go': 'go',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c'
  }
  return extensions[ext] || 'text'
}

if (process.argv.length < 3) {
  program.help()
}

program.parse()