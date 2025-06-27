// Options for the resolver
export interface ResolverOptions {
  // Path to start searching from (defaults to process.cwd())
  cwd?: string
  // Optional explicit config path
  configPath?: string
}