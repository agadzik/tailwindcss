module.exports = {
  presets: [
    require('../basic-config/tailwind.config.js')
  ],
  content: ['./build/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        primary: '#e74c3c', // Override preset primary color
        tertiary: '#9b59b6',
      }
    }
  },
  darkMode: 'media', // Override preset darkMode
}