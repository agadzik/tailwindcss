# tailwindcss-config-resolver

Resolve Tailwind CSS configurations to provide context for LLMs and other tools.

## Installation

```bash
npm install tailwindcss-config-resolver
```

## Usage

```javascript
import { resolveTailwindConfig } from 'tailwindcss-config-resolver'

// Automatically find and resolve config
const config = await resolveTailwindConfig()

// Specify a custom working directory
const config = await resolveTailwindConfig({ cwd: './my-project' })

// Use a specific config file
const config = await resolveTailwindConfig({ 
  configPath: './custom-tailwind.config.js' 
})
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
  content: {
    files: Array<{base: string; pattern: string} | {raw: string; extension?: string}>
  }
  theme: Record<string, Record<string, unknown>>  // Fully resolved theme values
  darkMode: DarkModeStrategy | null
  prefix: string
  important: boolean | string
  blocklist: string[]
  future: Record<string, boolean>
}
```

### Example Output

```javascript
{
  content: {
    files: [
      { base: '/path/to/project', pattern: './src/**/*.{js,jsx,ts,tsx}' }
    ]
  },
  theme: {
    colors: {
      blue: { 
        50: '#eff6ff', 
        100: '#dbeafe',
        // ... 
      },
      // ... all other colors
    },
    spacing: {
      0: '0px',
      1: '0.25rem',
      // ... all spacing values
    },
    // ... all other theme values
  },
  darkMode: 'class',
  prefix: '',
  important: false,
  blocklist: [],
  future: {}
}
```

## API

### `resolveTailwindConfig(options?)`

Main function to resolve a Tailwind configuration.

**Options:**
- `cwd` (string): Directory to start searching from (defaults to `process.cwd()`)
- `configPath` (string): Explicit path to config file

**Returns:** `Promise<ResolvedConfig>`

### `findConfigFile(cwd)`

Find a Tailwind config file starting from the given directory.

**Returns:** `Promise<string | null>`

### `loadConfigFile(path)`

Load a specific Tailwind config file.

**Returns:** `Promise<UserConfig>`

## Use Cases

This package is designed for tools that need to understand what Tailwind classes are available in a project, such as:

- LLM tools that need context about available Tailwind classes
- Documentation generators
- Code analysis tools
- IDE integrations

## License

MIT