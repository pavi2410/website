import { useEffect, useRef, useState, useCallback } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { parseAsString, useQueryState } from 'nuqs'
import { PLATFORMS, TLDS, NAME_VARIATIONS, type PlatformResult, type DomainResult } from './types'
import PlatformAvailabilityCard from './PlatformAvailabilityCard'
import DomainAvailabilityMatrix from './DomainAvailabilityMatrix'
import IconSearch from '~icons/tabler/search'
import IconLoader from '~icons/tabler/loader-2'

function NameCheckerContent() {
  const [searchName, setSearchName] = useQueryState(
    'name',
    parseAsString.withDefault('').withOptions({ shallow: false })
  )

  const [platformResults, setPlatformResults] = useState<Map<string, PlatformResult>>(new Map())
  const [domainResults, setDomainResults] = useState<Map<string, DomainResult>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const currentAbortController = useRef<AbortController | null>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkPlatforms = useCallback(async (name: string, signal: AbortSignal) => {
    const promises = PLATFORMS.map(async (platform) => {
      try {
        const response = await fetch(`/api/check-platform?name=${encodeURIComponent(name)}&platform=${encodeURIComponent(platform)}`, {
          signal,
        })
        const result = (await response.json()) as PlatformResult

        if (!signal.aborted) {
          setPlatformResults((prev) => new Map(prev).set(platform, result))
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || signal.aborted) return

        setPlatformResults((prev) =>
          new Map(prev).set(platform, {
            platform,
            available: false,
            link: '#',
            status: 'error',
          })
        )
      }
    })

    return Promise.allSettled(promises)
  }, [])

  const checkDomains = useCallback(async (name: string, signal: AbortSignal) => {
    const promises: Promise<void>[] = []

    for (const tld of TLDS) {
      for (const variation of NAME_VARIATIONS) {
        const key = `${variation}-${tld}`
        promises.push(
          (async () => {
            try {
              const response = await fetch(
                `/api/check-domain?name=${encodeURIComponent(name)}&variation=${encodeURIComponent(variation)}&tld=${encodeURIComponent(tld)}`,
                { signal }
              )
              const result = (await response.json()) as DomainResult

              if (!signal.aborted) {
                setDomainResults((prev) => new Map(prev).set(key, result))
              }
            } catch (err: any) {
              if (err.name === 'AbortError' || signal.aborted) return

              const actualVariation = variation.replace('-', name)
              setDomainResults((prev) =>
                new Map(prev).set(key, {
                  url: `https://${actualVariation}.${tld}`,
                  variation,
                  tld,
                  available: false,
                  priceInCents: 0,
                  status: 'error',
                })
              )
            }
          })()
        )
      }
    }

    return Promise.allSettled(promises)
  }, [])

  const doSearch = useCallback(async () => {
    const name = searchName.trim()
    if (!name) {
      setError('Please enter a name')
      return
    }

    if (currentAbortController.current) {
      currentAbortController.current.abort()
    }

    currentAbortController.current = new AbortController()
    const signal = currentAbortController.current.signal

    setError('')
    setIsLoading(true)
    setPlatformResults(new Map())
    setDomainResults(new Map())

    try {
      await Promise.all([checkPlatforms(name, signal), checkDomains(name, signal)])
    } catch (err: any) {
      if (err.name !== 'AbortError' && !signal.aborted) {
        setError('Search failed. Please try again.')
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [searchName, checkPlatforms, checkDomains])

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (searchName.trim()) {
      debounceTimer.current = setTimeout(() => {
        doSearch()
      }, 500)
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchName])

  useEffect(() => {
    return () => {
      if (currentAbortController.current) {
        currentAbortController.current.abort()
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      doSearch()
    }
  }

  return (
    <div className="flex flex-col h-full px-6 py-3 gap-6">
      {/* Search Section */}
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Find out if your project name is taken across platforms and domains
        </p>

        <div className="max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isLoading ? (
                <IconLoader className="h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <IconSearch className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <input
              type="text"
              defaultValue={searchName}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter project name..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {searchName.trim() ? (
        <div className="space-y-6 flex-1 overflow-auto">
          <DomainAvailabilityMatrix
            domainResults={domainResults}
            isLoading={isLoading}
            searchName={searchName}
            onRetry={doSearch}
          />

          <PlatformAvailabilityCard
            platformResults={platformResults}
            isLoading={isLoading}
            onRetry={doSearch}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <IconSearch className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Enter a name above to check availability</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NameChecker() {
  return (
    <NuqsAdapter>
      <NameCheckerContent />
    </NuqsAdapter>
  )
}
