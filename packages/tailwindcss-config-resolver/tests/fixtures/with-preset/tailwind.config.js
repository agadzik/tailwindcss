module.exports = {
  presets: [
    require('../basic-config/tailwind.config.js')
  ],
  content: ['./app/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        tertiary: '#f66d9b',
      }
    }
  }
}