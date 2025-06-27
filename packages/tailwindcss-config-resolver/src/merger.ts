import type { ResolvedThemeValue, ThemeValue } from "../../tailwindcss/src/compat/config/types"

/**
 * Check if a value is a plain object
 */
export function isPlainObject<T>(value: T): value is T & Record<keyof T, unknown> {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === null || Object.getPrototypeOf(prototype) === null
}

/**
 * Deep merge objects with a customizer function
 */
export function deepMerge<T extends object>(
  target: T,
  sources: (Partial<T> | null | undefined)[],
  customizer: (a: any, b: any, keypath: (keyof T)[]) => any,
  path: (keyof T)[] = [],
): T {
  type Key = keyof T
  type Value = T[Key]

  for (let source of sources) {
    if (source === null || source === undefined) {
      continue
    }

    for (let k of Reflect.ownKeys(source) as Key[]) {
      path.push(k)
      let merged = customizer(target[k], source[k], path)

      if (merged !== undefined) {
        target[k] = merged
      } else if (!isPlainObject(target[k]) || !isPlainObject(source[k])) {
        target[k] = source[k] as Value
      } else {
        target[k] = deepMerge({}, [target[k], source[k]], customizer, path as any) as Value
      }
      path.pop()
    }
  }

  return target
}

/**
 * Merge theme extensions
 */
export function mergeThemeExtension(
  themeValue: ThemeValue | ThemeValue[],
  extensionValue: ThemeValue | ThemeValue[],
): ResolvedThemeValue {
  // Always prefer the extension value if it's a complete replacement
  if (!isPlainObject(extensionValue)) {
    return extensionValue as ResolvedThemeValue
  }

  // If base is not an object, extension replaces it
  if (!isPlainObject(themeValue)) {
    return extensionValue as ResolvedThemeValue
  }

  // Deep merge the objects
  return deepMerge(
    {},
    [themeValue as any, extensionValue as any],
    () => undefined
  ) as ResolvedThemeValue
}