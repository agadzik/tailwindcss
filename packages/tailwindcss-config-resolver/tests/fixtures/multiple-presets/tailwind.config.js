module.exports = {
  presets: [
    require('../basic-config/tailwind.config.js'),
    require('../no-prefix/tailwind.config.js'),
  ],
  content: ['./dist/**/*.html'],
  theme: {
    extend: {
      colors: {
        quaternary: '#845ec2',
      }
    }
  },
  prefix: 'multi-',
}