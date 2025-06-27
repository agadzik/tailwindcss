module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        900: '#1e3a8a',
      },
      gray: {
        100: '#f3f4f6',
        500: '#6b7280',
        900: '#111827',
      }
    },
    spacing: {
      0: '0px',
      1: '0.25rem',
      2: '0.5rem',
      4: '1rem',
      8: '2rem',
    },
    extend: {
      colors: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      spacing: {
        18: '4.5rem',
        128: '32rem',
      }
    }
  },
  prefix: 'app-',
  darkMode: 'class',
}