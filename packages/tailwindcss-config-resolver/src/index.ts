import { dirname, resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import type { ResolverOptions } from './types'
import { findConfigFile } from './finder'
import { findV4ConfigFile } from './v4-finder'
import { __unstable__loadDesignSystem } from '@tailwindcss/node'
import type { Config } from 'tailwindcss'
import { loadModule } from '../../@tailwindcss-node/src/compile'
import { resolveConfig } from '../../tailwindcss/src/compat/config/resolve-config'
import { applyConfigToTheme } from '../../tailwindcss/src/compat/apply-config-to-theme'
import { applyKeyframesToTheme } from '../../tailwindcss/src/compat/apply-keyframes-to-theme'
import { registerContainerCompat } from '../../tailwindcss/src/compat/container'
import { registerScreensConfig } from '../../tailwindcss/src/compat/screens-config'
import { registerThemeVariantOverrides } from '../../tailwindcss/src/compat/theme-variants'
import { toCss, type AtRule } from '../../tailwindcss/src/ast'
import type { UserConfig } from '../../tailwindcss/src/compat/config/types'

interface ResolvedConfig {
  theme: Record<string, string>
  keyframes: Record<string, string>
  prefix?: string
  darkMode?: UserConfig['darkMode'] | null
}

/**
 * Resolve a Tailwind CSS configuration file and return the fully resolved config.
 * 
 * @param options - Options for resolving the config
 * @returns The fully resolved Tailwind configuration
 */
export async function resolveTailwindConfig(options: ResolverOptions = {}): Promise<ResolvedConfig> {
  const { cwd = process.cwd(), configPath } = options

  let cssContent = `
        @import 'tailwindcss';
      `
  let resolvedConfigPath: string | null = null
  let unresolvedUserConfig: Config | null = null

  // First, try to find a v4 CSS config file
  // If a specific config path is provided, don't search for v4 configs
  const v4ConfigPath = configPath ? null : await findV4ConfigFile(resolve(cwd))
  
  // Always use cwd as the base path for the design system to find node_modules
  let basePath = cwd
  
  if (v4ConfigPath) {
    // Found a v4 config, read the CSS content
    cssContent = await readFile(v4ConfigPath, 'utf-8')
  } else {
    // No v4 config found, try to find a v3 config
    if (configPath) {
      resolvedConfigPath = resolve(cwd, configPath)
      // Check if the explicitly provided config path exists
      try {
        await readFile(resolvedConfigPath, 'utf-8')
      } catch (error) {
        throw new Error(`Config file not found: ${resolvedConfigPath}`)
      }
    } else {
      resolvedConfigPath = await findConfigFile(resolve(cwd))
    }

    if (!resolvedConfigPath) {
      throw new Error('No config file found')
    }

    // Load the v3 config
    const loadResult = await loadModule(resolvedConfigPath, cwd, () => {})
    unresolvedUserConfig = loadResult.module as Config
  }

  // Load the design system with the appropriate CSS content
  const designSystem = await __unstable__loadDesignSystem(cssContent, { base: basePath })

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

    // Store resolved config values for later use
    const finalResult: ResolvedConfig = {
      theme: {},
      keyframes: {},
    }

    const themeValues: Map<string, { value: string }> = designSystem.theme.values;
    themeValues.forEach((value, key) => {
      finalResult.theme[key] = value.value
    })

    const themeKeyframes: Set<AtRule> = designSystem.theme.keyframes
    themeKeyframes.forEach((node) => {
      finalResult.keyframes[node.params] = toCss([node])
    })

    // Add prefix and darkMode if they exist
    finalResult.prefix = designSystem.theme.prefix || resolvedConfig?.prefix || undefined
    finalResult.darkMode = resolvedConfig?.darkMode ?? null

    return finalResult
  } else {
    // v4 config - extract values directly from design system
    const result: ResolvedConfig = {
      theme: {},
      keyframes: {},
    }

    const themeValues: Map<string, { value: string }> = designSystem.theme.values;
    themeValues.forEach((value, key) => {
      result.theme[key] = value.value
    })

    const themeKeyframes: Set<AtRule> = designSystem.theme.keyframes
    themeKeyframes.forEach((node) => {
      result.keyframes[node.params] = toCss([node])
    })

    // For v4, prefix comes from design system
    result.prefix = designSystem.theme.prefix || undefined
    result.darkMode = null // v4 doesn't have a darkMode config option

    return result
  }
}