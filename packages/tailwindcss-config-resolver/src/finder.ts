import { existsSync } from 'node:fs'
import { join, dirname, parse } from 'node:path'

// Config files to search for in priority order
const CONFIG_FILES = [
  'tailwind.config.ts',
  'tailwind.config.js',
  'tailwind.config.mjs',
  'tailwind.config.cjs',
]

/**
 * Find a Tailwind config file starting from the given directory
 * and traversing up the directory tree.
 */
export async function findConfigFile(cwd: string): Promise<string | null> {
  let currentDir = cwd
  const { root } = parse(currentDir)

  while (currentDir !== root) {
    // Check each config file name in the current directory
    for (const configFile of CONFIG_FILES) {
      const configPath = join(currentDir, configFile)
      if (existsSync(configPath)) {
        return configPath
      }
    }

    // Move up to parent directory
    currentDir = dirname(currentDir)
  }

  // Check root directory as well
  for (const configFile of CONFIG_FILES) {
    const configPath = join(root, configFile)
    if (existsSync(configPath)) {
      return configPath
    }
  }

  return null
}