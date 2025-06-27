module.exports = {
  content: ['./src/**/*.js'],
  theme: {
    colors: ({ theme }) => ({
      primary: '#3490dc',
      inherit: theme.colors.inherit,
      current: theme.colors.current,
    }),
    spacing: {
      sm: '8px',
      md: '16px',
      lg: '24px',
    },
    extend: {
      spacing: {
        xl: '32px',
      }
    }
  }
}