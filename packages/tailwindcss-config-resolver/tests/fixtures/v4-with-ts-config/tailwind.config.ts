import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        'ts-legacy': '#2563eb',
        'ts-modern': '#0ea5e9',
      },
      spacing: {
        'ts-lg': '3rem',
        'ts-xl': '4rem',
      }
    }
  },
  prefix: 'vts-',
}

export default config