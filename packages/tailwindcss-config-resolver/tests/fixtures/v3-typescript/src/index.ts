// Sample TypeScript file for content scanning
interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'sm' | 'md' | 'lg'
}

const Button: React.FC<ButtonProps> = ({ variant, size }) => {
  const classes = `ts-bg-typescript ts-text-white ts-p-4 ts-rounded-lg`
  return <button className={classes}>Click me</button>
}