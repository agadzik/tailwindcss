import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { __unstable__loadDesignSystem, loadModule } from '../../@tailwindcss-node/src/compile'
import { toCss } from '../../tailwindcss/src/ast'
import { applyConfigToTheme } from '../../tailwindcss/src/compat/apply-config-to-theme'
import { applyKeyframesToTheme } from '../../tailwindcss/src/compat/apply-keyframes-to-theme'
import { resolveConfig } from '../../tailwindcss/src/compat/config/resolve-config'
import type { UserConfig } from '../../tailwindcss/src/compat/config/types'
import { registerContainerCompat } from '../../tailwindcss/src/compat/container'
import { registerScreensConfig } from '../../tailwindcss/src/compat/screens-config'
import { registerThemeVariantOverrides } from '../../tailwindcss/src/compat/theme-variants'
import { findConfigFile } from './finder'
import { findV4ConfigFile } from './v4-finder'

interface ResolvedConfig {
  theme: Record<string, string>
  keyframes: Record<string, string>
  prefix?: string
  darkMode?: UserConfig['darkMode'] | null
}

/**
 * Resolve a Tailwind CSS configuration file and return the fully resolved config.
 *
 * @param cwd - The current working directory to resolve the config from
 * @returns The fully resolved Tailwind configuration
 */
export async function resolveTailwindConfig(cwd: string = process.cwd()): Promise<ResolvedConfig> {
  let cssContent = `
        @import 'tailwindcss';
      `
  let resolvedConfigPath: string | null = null
  let unresolvedUserConfig: UserConfig | null = null

  // First, try to find a v4 CSS config file
  const v4ConfigPath = await findV4ConfigFile(resolve(cwd))

  // Always use cwd as the base path for the design system to find node_modules
  let basePath = cwd

  if (v4ConfigPath) {
    // Found a v4 config, read the CSS content
    cssContent = await readFile(v4ConfigPath, 'utf-8')
  } else {
    // No v4 config found, try to find a v3 config
    resolvedConfigPath = await findConfigFile(resolve(cwd))

    if (!resolvedConfigPath) {
      throw new Error('No config file found')
    }

    // Load the v3 config
    const loadResult = await loadModule(resolvedConfigPath, cwd, () => {})
    unresolvedUserConfig = loadResult.module as UserConfig
  }

  // Load the design system with the appropriate CSS content
  let designSystem: Awaited<ReturnType<typeof __unstable__loadDesignSystem>> | undefined;
  try {
    designSystem = await __unstable__loadDesignSystem(cssContent, {
      base: basePath,
    })
  } catch (_err) {
    // this happens when were in a cwd that doesnt have tailwindcss v4+ installed
    designSystem = await __unstable__loadDesignSystem('', {
      base: basePath,
    })
  }

  let resolvedConfig: any = null

  // If we have a v3 config, apply it
  if (unresolvedUserConfig && resolvedConfigPath) {
    const result = resolveConfig(designSystem, [
      { base: dirname(resolvedConfigPath), config: unresolvedUserConfig, reference: false },
    ])
    resolvedConfig = result.resolvedConfig
    const replacedThemeKeys = result.replacedThemeKeys

    applyConfigToTheme(designSystem, resolvedConfig, replacedThemeKeys)
    applyKeyframesToTheme(designSystem, resolvedConfig, replacedThemeKeys)
    registerThemeVariantOverrides(resolvedConfig, designSystem)
    registerScreensConfig(resolvedConfig, designSystem)
    registerContainerCompat(resolvedConfig, designSystem)
  }

  // Store resolved config values for later use
  const finalResult: ResolvedConfig = {
    theme: {},
    keyframes: {},
  }

  const themeValues = Object.fromEntries(designSystem.theme.entries())
  for (const key in themeValues) {
    finalResult.theme[key] = themeValues[key].value
  }

  const themeKeyframes = designSystem.theme.getKeyframes()
  themeKeyframes.forEach((node) => {
    finalResult.keyframes[node.params] = toCss([node])
  })

  // Add prefix and darkMode if they exist
  finalResult.prefix = designSystem.theme.prefix || resolvedConfig?.prefix || undefined
  finalResult.darkMode = resolvedConfig?.darkMode ?? null

  return finalResult
}
