import { spawn } from 'node:child_process'
import { rgPath } from '@vscode/ripgrep'

interface RipgrepMatch {
  type: string
  data?: {
    path?: {
      text: string
    }
  }
}

/**
 * Find CSS files containing Tailwind v4 imports using ripgrep
 */
export async function findV4ConfigFile(cwd: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const args = [
      // Pattern to match @import 'tailwindcss' with various quote styles and whitespace
      '@import\\s+[\'"]tailwindcss[\'"]',
      '--type', 'css',
      '--json',
      cwd
    ]

    const rg = spawn(rgPath, args)
    const matches: string[] = []
    let buffer = ''

    rg.stdout.on('data', (data) => {
      buffer += data.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) continue
        
        try {
          const json: RipgrepMatch = JSON.parse(line)
          if (json.type === 'match' && json.data?.path?.text) {
            const filePath = json.data.path.text
            if (!matches.includes(filePath)) {
              matches.push(filePath)
            }
          }
        } catch (e) {
          // Ignore invalid JSON lines
        }
      }
    })

    rg.stderr.on('data', (data) => {
      // Ignore stderr unless it's a fatal error
      const error = data.toString()
      if (error.includes('error:')) {
        reject(new Error(`ripgrep error: ${error}`))
      }
    })

    rg.on('error', (err) => {
      reject(err)
    })

    rg.on('close', (code) => {
      if (code !== 0 && code !== 1 && code !== 2) {
        // Code 1 means no matches found, which is not an error
        // Code 2 can mean directory doesn't exist, which we handle gracefully
        reject(new Error(`ripgrep exited with code ${code}`))
      } else {
        // Return the first match found, or null if no matches
        resolve(matches.length > 0 ? matches[0] : null)
      }
    })
  })
}