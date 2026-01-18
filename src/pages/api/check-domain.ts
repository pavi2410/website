import type { APIRoute } from 'astro'

export const prerender = false

interface DomainResult {
  url: string
  variation: string
  tld: string
  available: boolean
  priceInCents: number
  status: 'success' | 'error'
  expires?: string
  error?: string
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const name = url.searchParams.get('name')
  const variation = url.searchParams.get('variation')
  const tld = url.searchParams.get('tld')

  if (!name || !variation || !tld) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const actualVariation = variation.replace('-', name)
  const domain = `${actualVariation}.${tld}`
  const domainUrl = `https://${domain}`

  try {
    // Use a simple DNS-based check via public API
    // Note: For production, consider using a proper domain availability API
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`)
    const data = await response.json()
    
    // If there's no answer or status indicates NXDOMAIN, the domain might be available
    // Status 3 = NXDOMAIN (domain doesn't exist)
    const available = data.Status === 3 || (!data.Answer && data.Status !== 0)

    const result: DomainResult = {
      url: domainUrl,
      variation,
      tld,
      available,
      priceInCents: 0,
      status: 'success',
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const result: DomainResult = {
      url: domainUrl,
      variation,
      tld,
      available: false,
      priceInCents: 0,
      status: 'error',
      error: 'Failed to check domain availability',
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
