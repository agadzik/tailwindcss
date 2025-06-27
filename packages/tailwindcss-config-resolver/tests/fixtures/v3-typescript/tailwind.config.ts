import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        typescript: '#3178c6',
        jsyellow: '#f7df1e',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'],
      }
    }
  },
  prefix: 'ts-',
  darkMode: 'class',
  plugins: [],
}

export default config