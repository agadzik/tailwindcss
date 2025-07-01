#!/usr/bin/env node

import { resolveTailwindConfig } from './index'

interface Args {
  _: string[]
  '--cwd': string | null
  '-w': string | null
  '--help': boolean
  '-h': boolean
}

function parseArgs(argv: string[] = process.argv.slice(2)): Args {
  const args: Args = {
    _: [],
    '--cwd': null,
    '-w': null,
    '--help': false,
    '-h': false
  }

  let i = 0
  while (i < argv.length) {
    const arg = argv[i]
    
    if (arg === '--cwd' || arg === '-w') {
      args['--cwd'] = argv[i + 1] || null
      args['-w'] = argv[i + 1] || null
      i += 2
    } else if (arg === '--help' || arg === '-h') {
      args['--help'] = true
      args['-h'] = true
      i++
    } else if (arg.startsWith('-')) {
      console.error(`Unknown option: ${arg}`)
      process.exit(1)
    } else {
      args._.push(arg)
      i++
    }
  }

  return args
}

function showHelp() {
  console.log(`tailwindcss-config-resolver - Resolve Tailwind CSS configurations

Usage: tailwindcss-config-resolver [options]

Options:
  -w, --cwd <dir>   Specify the working directory (default: current directory)
  -h, --help        Show this help message

Examples:
  tailwindcss-config-resolver                    # Use current directory
  tailwindcss-config-resolver -w ./my-project    # Use specific directory
  tailwindcss-config-resolver --cwd /path/to/dir # Use absolute path
`)
}

async function main() {
  const args = parseArgs()

  if (args['--help'] || args['-h']) {
    showHelp()
    process.exit(0)
  }

  const cwd = args['--cwd'] || args['-w'] || process.cwd()

  try {
    const config = await resolveTailwindConfig(cwd)
    console.log(JSON.stringify(config, null, 2))
  } catch (error) {
    console.error('Error resolving Tailwind config:', (error as Error).message)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})