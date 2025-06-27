import { execSync } from 'node:child_process'
import { rm, access } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Set up a test fixture by installing its dependencies
 */
export async function setupFixture(fixturePath: string): Promise<() => Promise<void>> {
  // Install dependencies using pnpm
  // Using --prefer-offline and workspace protocol for speed
  try {
    execSync('pnpm install --prefer-offline --no-lockfile --reporter=silent', {
      cwd: fixturePath,
      stdio: 'pipe',
      env: {
        ...process.env,
        // Ensure we're in CI mode to avoid interactive prompts
        CI: 'true'
      }
    })
  } catch (error) {
    console.error(`Failed to install dependencies in ${fixturePath}:`, error)
    throw error
  }

  // Return cleanup function
  return async () => {
    await cleanupFixture(fixturePath)
  }
}

/**
 * Clean up a test fixture by removing node_modules and lock files
 */
export async function cleanupFixture(fixturePath: string): Promise<void> {
  const nodeModulesPath = join(fixturePath, 'node_modules')
  const lockfilePath = join(fixturePath, 'pnpm-lock.yaml')

  // Remove node_modules if it exists
  try {
    await access(nodeModulesPath)
    await rm(nodeModulesPath, { recursive: true, force: true })
  } catch {
    // Directory doesn't exist, ignore
  }

  // Remove lockfile if it exists
  try {
    await access(lockfilePath)
    await rm(lockfilePath)
  } catch {
    // File doesn't exist, ignore
  }
}