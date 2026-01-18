import { PLATFORMS, PLATFORM_DISPLAY_NAMES, PLATFORM_ICONS, type Platform, type PlatformResult } from './types'
import IconCheck from '~icons/tabler/circle-check'
import IconX from '~icons/tabler/circle-x'
import IconQuestion from '~icons/tabler/circle-dashed'
import IconWarning from '~icons/tabler/alert-triangle'
import IconLoader from '~icons/tabler/loader-2'

import IconGithub from '~icons/devicon/github'
import IconPython from '~icons/devicon/python'
import IconHomebrew from '~icons/devicon/homebrew'
import IconRust from '~icons/devicon/rust'
import IconNpm from '~icons/devicon/npm-wordmark'
import IconRuby from '~icons/devicon/ruby'
import IconNuget from '~icons/devicon/nuget'
import IconComposer from '~icons/devicon/composer'
import IconGo from '~icons/devicon/go'

interface Props {
  platformResults: Map<string, PlatformResult>
  isLoading: boolean
  onRetry: () => void
}

const PlatformIconMap: Record<Platform, React.ComponentType<{ className?: string }>> = {
  'GitHub repo': IconGithub,
  'GitHub org/user': IconGithub,
  'PyPI package': IconPython,
  'Homebrew cask/formula': IconHomebrew,
  'Rust crate': IconRust,
  'npm package': IconNpm,
  'npm org': IconNpm,
  'Ruby gem': IconRuby,
  'Nuget package': IconNuget,
  'Packagist package': IconComposer,
  'Go package': IconGo,
}

export default function PlatformAvailabilityCard({ platformResults, isLoading, onRetry }: Props) {
  const hasResults = platformResults.size > 0
  const hasError = Array.from(platformResults.values()).some((result) => result.status === 'error')

  const getPlatformResult = (platform: Platform) => platformResults.get(platform)

  const getPlatformCardClass = (platform: Platform) => {
    const result = getPlatformResult(platform)
    if (!result) return 'border-gray-200 dark:border-gray-700'

    if (result.status === 'error') {
      return 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-600 dark:bg-yellow-950 dark:hover:bg-yellow-900'
    }

    return result.available
      ? 'border-green-300 bg-green-50 hover:bg-green-100 dark:border-green-600 dark:bg-green-950 dark:hover:bg-green-900'
      : 'border-red-300 bg-red-50 hover:bg-red-100 dark:border-red-600 dark:bg-red-950 dark:hover:bg-red-900'
  }

  const getStatusIcon = (platform: Platform) => {
    const result = getPlatformResult(platform)
    if (!result) return <IconQuestion className="text-gray-400 dark:text-gray-500" />

    if (result.status === 'error') return <IconWarning className="text-yellow-600 dark:text-yellow-500" />
    return result.available ? (
      <IconCheck className="text-green-600 dark:text-green-500" />
    ) : (
      <IconX className="text-red-600 dark:text-red-500" />
    )
  }

  const renderPlatformCard = (platform: Platform) => {
    const result = getPlatformResult(platform)
    const PlatformIcon = PlatformIconMap[platform]
    const isLoadingPlatform = isLoading && !result

    return (
      <a
        key={platform}
        href={result?.link || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative w-20 h-20 flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${getPlatformCardClass(platform)}`}
      >
        {isLoadingPlatform ? (
          <IconLoader className="text-2xl mb-1 text-gray-400 animate-spin" />
        ) : (
          <PlatformIcon className="text-2xl mb-1" />
        )}
        <span className="text-xs text-center font-medium text-gray-700 dark:text-gray-300 leading-tight">
          {PLATFORM_DISPLAY_NAMES[platform]}
        </span>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
          {isLoadingPlatform ? <IconLoader className="text-sm text-gray-400 animate-spin" /> : getStatusIcon(platform)}
        </div>
      </a>
    )
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Platform Availability</h3>
      </div>

      <div className="p-4">
        {hasResults || isLoading ? (
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((platform) => renderPlatformCard(platform))}
          </div>
        ) : hasError && !isLoading ? (
          <div className="text-center py-8">
            <IconWarning className="text-yellow-500 text-2xl mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Failed to check platform availability</p>
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">Enter a name to check platform availability</p>
          </div>
        )}
      </div>
    </div>
  )
}
