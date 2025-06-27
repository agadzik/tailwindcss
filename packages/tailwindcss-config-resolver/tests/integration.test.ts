import { describe, it, expect, afterEach } from 'vitest'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveTailwindConfig } from '../src'
import { setupFixture } from './helpers'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const fixturesDir = join(__dirname, 'fixtures')

describe('Integration tests', () => {
  let cleanupFns: Array<() => Promise<void>> = []

  afterEach(async () => {
    // Clean up all fixtures used in the test
    for (const cleanup of cleanupFns) {
      await cleanup()
    }
    cleanupFns = []
  })
  it('should handle theme functions correctly', async () => {
    const fixturePath = join(fixturesDir, 'theme-function')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Theme function should be resolved
    expect(resolved.theme['--color-primary']).toBe('#3490dc')
    expect(resolved.theme['--color-inherit']).toBe('inherit')
    expect(resolved.theme['--color-current']).toBe('currentcolor')

    // Extended spacing should be merged
    expect(resolved.theme['--spacing-sm']).toBe('8px')
    expect(resolved.theme['--spacing-md']).toBe('16px')
    expect(resolved.theme['--spacing-lg']).toBe('24px')
    expect(resolved.theme['--spacing-xl']).toBe('32px')
  })

  it('should handle missing theme sections', async () => {
    const fixturePath = join(fixturesDir, 'basic-config')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have default colors added
    expect(resolved.theme['--color-black']).toBe('#000')
    expect(resolved.theme['--color-white']).toBe('#fff')
    
    // Should also have extended colors
    expect(resolved.theme['--color-primary']).toBe('#3490dc')
    expect(resolved.theme['--color-secondary']).toBe('#ffed4a')
    
    // Should have prefix and darkMode settings
    expect(resolved.prefix).toBe('tw')
    expect(resolved.darkMode).toBe('class')
  })

  it('should handle configs with presets', async () => {
    const fixturePath = join(fixturesDir, 'with-preset')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have default colors
    expect(resolved.theme['--color-black']).toBe('#000')
    expect(resolved.theme['--color-white']).toBe('#fff')
    
    // Should have colors from the preset
    expect(resolved.theme['--color-primary']).toBe('#3490dc')
    expect(resolved.theme['--color-secondary']).toBe('#ffed4a')
    
    // Should have extended colors from the main config
    expect(resolved.theme['--color-tertiary']).toBe('#f66d9b')
    
    // Should inherit other preset settings
    expect(resolved.prefix).toBe('tw')
    expect(resolved.darkMode).toBe('class')
  })

  it('should handle empty configuration', async () => {
    const fixturePath = join(fixturesDir, 'empty-config')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have default theme values
    expect(resolved.theme['--color-black']).toBe('#000')
    expect(resolved.theme['--color-white']).toBe('#fff')
    
    // Should not have prefix or darkMode
    expect(resolved.prefix).toBeUndefined()
    expect(resolved.darkMode).toBeNull()
  })

  it('should handle config without prefix', async () => {
    const fixturePath = join(fixturesDir, 'no-prefix')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have custom color
    expect(resolved.theme['--color-custom']).toBe('#123456')
    
    // Should not have prefix
    expect(resolved.prefix).toBeUndefined()
    
    // Should have darkMode
    expect(resolved.darkMode).toBe('class')
  })

  it('should handle media darkMode', async () => {
    const fixturePath = join(fixturesDir, 'media-darkmode')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have accent color
    expect(resolved.theme['--color-accent']).toBe('#ff6b6b')
    
    // Should have prefix and media darkMode
    expect(resolved.prefix).toBe('tw-')
    expect(resolved.darkMode).toBe('media')
  })

  it('should handle darkMode false', async () => {
    const fixturePath = join(fixturesDir, 'no-darkmode')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have brand color
    expect(resolved.theme['--color-brand']).toBe('#5e72e4')
    
    // Should have prefix and darkMode false
    expect(resolved.prefix).toBe('util-')
    expect(resolved.darkMode).toBe(false)
  })

  it('should handle complex theme structures', async () => {
    const fixturePath = join(fixturesDir, 'complex-theme')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have nested color values
    expect(resolved.theme['--color-primary-50']).toBe('#eff6ff')
    expect(resolved.theme['--color-primary-100']).toBe('#dbeafe')
    expect(resolved.theme['--color-primary-500']).toBe('#3b82f6')
    expect(resolved.theme['--color-primary-900']).toBe('#1e3a8a')
    
    expect(resolved.theme['--color-gray-100']).toBe('#f3f4f6')
    expect(resolved.theme['--color-gray-500']).toBe('#6b7280')
    expect(resolved.theme['--color-gray-900']).toBe('#111827')
    
    // Should have extended colors
    expect(resolved.theme['--color-success']).toBe('#10b981')
    expect(resolved.theme['--color-warning']).toBe('#f59e0b')
    expect(resolved.theme['--color-error']).toBe('#ef4444')
    
    // Should have spacing values
    expect(resolved.theme['--spacing-0']).toBe('0px')
    expect(resolved.theme['--spacing-1']).toBe('0.25rem')
    expect(resolved.theme['--spacing-2']).toBe('0.5rem')
    expect(resolved.theme['--spacing-4']).toBe('1rem')
    expect(resolved.theme['--spacing-8']).toBe('2rem')
    expect(resolved.theme['--spacing-18']).toBe('4.5rem')
    expect(resolved.theme['--spacing-128']).toBe('32rem')
    
    // Should have prefix and darkMode
    expect(resolved.prefix).toBe('app-')
    expect(resolved.darkMode).toBe('class')
  })

  it('should handle multiple presets', async () => {
    const fixturePath = join(fixturesDir, 'multiple-presets')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have colors from first preset
    expect(resolved.theme['--color-primary']).toBe('#3490dc')
    expect(resolved.theme['--color-secondary']).toBe('#ffed4a')
    
    // Should have colors from second preset
    expect(resolved.theme['--color-custom']).toBe('#123456')
    
    // Should have extended color from main config
    expect(resolved.theme['--color-quaternary']).toBe('#845ec2')
    
    // Should use prefix from main config (overrides presets)
    expect(resolved.prefix).toBe('multi-')
    
    // Should use darkMode from last preset
    expect(resolved.darkMode).toBe('class')
  })

  it('should handle preset overrides', async () => {
    const fixturePath = join(fixturesDir, 'override-preset')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have overridden primary color
    expect(resolved.theme['--color-primary']).toBe('#e74c3c')
    
    // Should still have secondary from preset
    expect(resolved.theme['--color-secondary']).toBe('#ffed4a')
    
    // Should have new tertiary color
    expect(resolved.theme['--color-tertiary']).toBe('#9b59b6')
    
    // Should inherit prefix from preset
    expect(resolved.prefix).toBe('tw')
    
    // Should have overridden darkMode
    expect(resolved.darkMode).toBe('media')
  })

  it('should handle keyframes configuration', async () => {
    const fixturePath = join(fixturesDir, 'keyframes-config')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have theme values
    expect(resolved.theme['--color-animated']).toBe('#8b5cf6')
    
    // Should have keyframes
    expect(resolved.keyframes).toBeDefined()
    expect(Object.keys(resolved.keyframes)).toContain('wiggle')
    expect(Object.keys(resolved.keyframes)).toContain('fadeIn')
    expect(Object.keys(resolved.keyframes)).toContain('slideUp')
    
    // Verify keyframe content includes the animation steps
    expect(resolved.keyframes.wiggle).toContain('0%, 100%')
    expect(resolved.keyframes.wiggle).toContain('50%')
    expect(resolved.keyframes.fadeIn).toContain('0%')
    expect(resolved.keyframes.fadeIn).toContain('100%')
    
    // Should have prefix and darkMode
    expect(resolved.prefix).toBe('anim-')
    expect(resolved.darkMode).toBe('class')
  })

  it('should throw error for non-existent config file', async () => {
    // This test doesn't need a fixture setup since it's testing a non-existent path
    await expect(
      resolveTailwindConfig(join(fixturesDir, 'non-existent-dir'))
    ).rejects.toThrow('No config file found')
  })



  // V4 Config Tests
  it('should handle v4 basic config', async () => {
    const fixturePath = join(fixturesDir, 'v4-basic')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have v4 theme values
    expect(resolved.theme['--color-primary']).toBe('#3490dc')
    expect(resolved.theme['--color-secondary']).toBe('#ffed4a')
    
    // V4 configs don't have darkMode
    expect(resolved.darkMode).toBeNull()
  })

  it('should handle v4 config with double quotes', async () => {
    const fixturePath = join(fixturesDir, 'v4-quotes')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have theme values
    expect(resolved.theme['--color-brand']).toBe('#5e72e4')
  })

  it('should handle v4 config with whitespace variations', async () => {
    const fixturePath = join(fixturesDir, 'v4-whitespace')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have theme values
    expect(resolved.theme['--spacing-custom']).toBe('2.5rem')
  })

  it('should find v4 config in nested directories', async () => {
    const fixturePath = join(fixturesDir, 'v4-nested')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should find and resolve the nested config
    expect(resolved.theme['--color-accent']).toBe('#ff6b6b')
  })

  it('should handle v4 config with @config directive', async () => {
    const fixturePath = join(fixturesDir, 'v4-with-config')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have v4 theme values
    expect(resolved.theme['--legacy-color-v4-custom']).toBe('#123456')
    
    // Should also have values from the legacy config
    expect(resolved.theme['--legacy-color-legacy']).toBe('#9b59b6')
    
    // Should use prefix from legacy config (v4 strips trailing dash)
    expect(resolved.prefix).toBe('legacy')
  })

  it('should fall back to v3 when no v4 config found', async () => {
    const fixturePath = join(fixturesDir, 'v3-only')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have v3 config values
    expect(resolved.theme['--color-v3primary']).toBe('#7c3aed')
    expect(resolved.theme['--color-v3secondary']).toBe('#ec4899')
    
    // Should have v3 prefix and darkMode
    expect(resolved.prefix).toBe('v3-')
    expect(resolved.darkMode).toBe('media')
  })

  it('should find first v4 config when multiple exist', async () => {
    const fixturePath = join(fixturesDir, 'v4-multiple')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should find one of the configs (ripgrep will determine order)
    // Both configs define different colors, so we can check which was found
    const hasApp = resolved.theme['--color-app'] === '#3498db'
    const hasAdmin = resolved.theme['--color-admin'] === '#e74c3c'
    
    // Should have found exactly one of them
    expect(hasApp || hasAdmin).toBe(true)
    expect(hasApp && hasAdmin).toBe(false)
  })

  it('should not find CSS without Tailwind import', async () => {
    const fixturePath = join(fixturesDir, 'v4-no-import')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    // This should fall back to looking for v3 configs
    await expect(
      resolveTailwindConfig(fixturePath)
    ).rejects.toThrow('No config file found')
  })

  it('should handle v3 TypeScript config', async () => {
    const fixturePath = join(fixturesDir, 'v3-typescript')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have TypeScript-specific colors
    expect(resolved.theme['--color-typescript']).toBe('#3178c6')
    expect(resolved.theme['--color-jsyellow']).toBe('#f7df1e')
    
    // Should have custom spacing
    expect(resolved.theme['--spacing-18']).toBe('4.5rem')
    expect(resolved.theme['--spacing-88']).toBe('22rem')
    
    // Should have prefix and darkMode
    expect(resolved.prefix).toBe('ts-')
    expect(resolved.darkMode).toBe('class')
  })

  it('should handle v4 config with TypeScript @config directive', async () => {
    const fixturePath = join(fixturesDir, 'v4-with-ts-config')
    const cleanup = await setupFixture(fixturePath)
    cleanupFns.push(cleanup)

    const resolved = await resolveTailwindConfig(fixturePath)

    // Should have v4 theme values
    expect(resolved.theme['--vts-color-v4-ts']).toBe('#8b5cf6')
    expect(resolved.theme['--vts-spacing-v4']).toBe('5rem')
    
    // Should also have values from the TypeScript config
    expect(resolved.theme['--vts-color-ts-legacy']).toBe('#2563eb')
    expect(resolved.theme['--vts-color-ts-modern']).toBe('#0ea5e9')
    expect(resolved.theme['--vts-spacing-ts-lg']).toBe('3rem')
    expect(resolved.theme['--vts-spacing-ts-xl']).toBe('4rem')
    
    // Should use prefix from TypeScript config (v4 strips trailing dash)
    expect(resolved.prefix).toBe('vts')
  })
})