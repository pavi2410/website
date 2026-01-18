import { TLDS, NAME_VARIATIONS, type DomainResult, type NameVariation, type TLD } from './types'
import IconCheck from '~icons/tabler/circle-check'
import IconX from '~icons/tabler/circle-x'
import IconQuestion from '~icons/tabler/circle-dashed'
import IconWarning from '~icons/tabler/alert-triangle'
import IconLoader from '~icons/tabler/loader-2'

interface Props {
  domainResults: Map<string, DomainResult>
  isLoading: boolean
  searchName: string
  onRetry: () => void
}

export default function DomainAvailabilityMatrix({ domainResults, isLoading, searchName, onRetry }: Props) {
  const hasResults = domainResults.size > 0
  const hasError = Array.from(domainResults.values()).some((result) => result.status === 'error')

  const getDomainKey = (variation: NameVariation, tld: TLD) => `${variation}-${tld}`

  const getDomainResult = (variation: NameVariation, tld: TLD) => {
    return domainResults.get(getDomainKey(variation, tld))
  }

  const getDomainUrl = (variation: NameVariation, tld: TLD) => {
    if (!searchName) return `https://${variation}.${tld}`
    const actualVariation = variation.replace('-', searchName)
    return `https://${actualVariation}.${tld}`
  }

  const getDisplayName = (variation: NameVariation) => {
    return variation
  }

  const getStatusIcon = (variation: NameVariation, tld: TLD) => {
    const result = getDomainResult(variation, tld)
    const isLoadingCell = isLoading && !result

    if (isLoadingCell) {
      return <IconLoader className="text-lg text-gray-400 animate-spin" />
    }

    if (!result) {
      return <IconQuestion className="text-lg text-gray-300 dark:text-gray-600" />
    }

    if (result.status === 'error') {
      return <IconWarning className="text-lg text-yellow-500 dark:text-yellow-400" />
    }

    return result.available ? (
      <IconCheck className="text-lg text-green-500 dark:text-green-400" />
    ) : (
      <IconX className="text-lg text-red-500 dark:text-red-400" />
    )
  }

  const getTooltipText = (variation: NameVariation, tld: TLD) => {
    const result = getDomainResult(variation, tld)
    if (!result) return getDomainUrl(variation, tld)

    if (result.status === 'error') {
      return result.error || 'Error checking domain'
    }

    if (!result.available && result.expires) {
      const expiryDate = new Date(result.expires)
      const localExpiry = expiryDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      return `Expires: ${localExpiry}`
    }

    return result.available ? 'Available' : 'Not available'
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Domain Availability</h3>
      </div>

      <div className="p-4 overflow-x-auto">
        {hasError && !isLoading && !hasResults ? (
          <div className="text-center py-8">
            <IconWarning className="text-yellow-500 text-2xl mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Failed to check domain availability</p>
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300">Name</th>
                {TLDS.map((tld) => (
                  <th key={tld} className="p-2 font-medium text-gray-700 dark:text-gray-300 text-center">
                    .{tld}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NAME_VARIATIONS.map((variation) => (
                <tr key={variation} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="p-2 font-mono text-gray-600 dark:text-gray-400">{getDisplayName(variation)}</td>
                  {TLDS.map((tld) => (
                    <td key={`${variation}-${tld}`} className="p-2 text-center">
                      <a
                        href={getDomainUrl(variation, tld)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={getTooltipText(variation, tld)}
                        className="inline-flex items-center justify-center p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {getStatusIcon(variation, tld)}
                      </a>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!hasResults && !isLoading && !hasError && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p className="text-sm">Enter a name above to check domain availability</p>
          </div>
        )}
      </div>
    </div>
  )
}
