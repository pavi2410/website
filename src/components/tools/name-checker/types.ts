export interface PlatformResult {
  platform: string
  available: boolean
  link: string
  status: 'success' | 'error'
}

export interface DomainResult {
  url: string
  variation: string
  tld: string
  available: boolean
  priceInCents: number
  status: 'success' | 'error'
  expires?: string
  error?: string
}

export const PLATFORMS = [
  'GitHub repo',
  'GitHub org/user',
  'PyPI package',
  'Homebrew cask/formula',
  'Rust crate',
  'npm package',
  'npm org',
  'Ruby gem',
  'Nuget package',
  'Packagist package',
  'Go package',
] as const

export const TLDS = ['com', 'net', 'org', 'io', 'dev', 'app', 'in', 'tech', 'co', 'ai', 'xyz', 'me', 'ing'] as const

export const NAME_VARIATIONS = ['-', 'get-', 'try-', '-app', '-ly'] as const

export type Platform = (typeof PLATFORMS)[number]
export type TLD = (typeof TLDS)[number]
export type NameVariation = (typeof NAME_VARIATIONS)[number]

export const PLATFORM_ICONS: Record<Platform, string> = {
  'GitHub repo': 'devicon:github',
  'GitHub org/user': 'devicon:github',
  'PyPI package': 'devicon:python',
  'Homebrew cask/formula': 'devicon:homebrew',
  'Rust crate': 'devicon:rust',
  'npm package': 'devicon:npm-wordmark',
  'npm org': 'devicon:npm-wordmark',
  'Ruby gem': 'devicon:ruby',
  'Nuget package': 'devicon:nuget',
  'Packagist package': 'devicon:composer',
  'Go package': 'devicon:go',
}

export const PLATFORM_DISPLAY_NAMES: Record<Platform, string> = {
  'GitHub repo': 'GitHub',
  'GitHub org/user': 'GitHub User',
  'PyPI package': 'PyPI',
  'Homebrew cask/formula': 'Homebrew',
  'Rust crate': 'Crates.io',
  'npm package': 'npm',
  'npm org': 'npm Org',
  'Ruby gem': 'RubyGems',
  'Nuget package': 'NuGet',
  'Packagist package': 'Packagist',
  'Go package': 'Go Packages',
}
