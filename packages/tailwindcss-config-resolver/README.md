# tailwindcss-config-resolver

Resolve Tailwind CSS configurations to provide context for LLMs and other tools.

## Installation

```bash
npm install tailwindcss-config-resolver
```

## Usage

```javascript
import { resolveTailwindConfig } from 'tailwindcss-config-resolver'

// Automatically find and resolve config in current directory
const config = await resolveTailwindConfig()

// Specify a custom working directory
const config = await resolveTailwindConfig('./my-project')
```

## What It Does

This package resolves Tailwind CSS configuration files and returns the fully resolved configuration values that affect which Tailwind classes are available. It:

- Finds Tailwind config files automatically
- Loads TypeScript, ESM, and CommonJS configs
- Resolves all presets recursively
- Executes theme functions to get static values
- Merges theme extensions properly
- Returns only the resolved values (no plugin functions)

## Returned Configuration

The resolved configuration includes:

```typescript
interface ResolvedConfig {
  theme: Record<string, string>      // Flat key-value pairs of theme values
  keyframes: Record<string, string>  // CSS keyframe definitions
  prefix?: string                    // Class prefix if configured
  darkMode?: 'class' | 'media' | false | null  // Dark mode strategy
}
```

### Example Output

```javascript
{
  theme: {
    '--color-black': '#000',
    '--color-white': '#fff',
    '--color-primary': '#3490dc',
    '--color-primary-50': '#eff6ff',
    '--color-primary-100': '#dbeafe',
    '--color-primary-500': '#3b82f6',
    '--color-primary-900': '#1e3a8a',
    '--spacing-0': '0px',
    '--spacing-1': '0.25rem',
    '--spacing-2': '0.5rem',
    '--spacing-4': '1rem',
    // ... all other theme values as flat key-value pairs
  },
  keyframes: {
    wiggle: '@keyframes wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }',
    fadeIn: '@keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }',
    // ... all other keyframe definitions
  },
  prefix: 'tw-',
  darkMode: 'class'
}
```

## API

### `resolveTailwindConfig(cwd?)`

Main function to resolve a Tailwind configuration.

**Parameters:**
- `cwd` (string): Directory to start searching from (defaults to `process.cwd()`)

**Returns:** `Promise<ResolvedConfig>`

## Use Cases

This package is designed for tools that need to understand what Tailwind classes are available in a project, such as:

- LLM tools that need context about available Tailwind classes
- Documentation generators
- Code analysis tools
- IDE integrations

## License

MIT