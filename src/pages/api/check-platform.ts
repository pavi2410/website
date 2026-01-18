import type { APIRoute } from 'astro'

export const prerender = false

interface PlatformResult {
  platform: string
  available: boolean
  link: string
  status: 'success' | 'error'
}

const platformCheckers: Record<string, (name: string) => Promise<PlatformResult>> = {
  'GitHub repo': async (name) => {
    const link = `https://github.com/${name}/${name}`
    try {
      const res = await fetch(`https://api.github.com/repos/${name}/${name}`, {
        headers: { 'User-Agent': 'name-checker' },
      })
      return {
        platform: 'GitHub repo',
        available: res.status === 404,
        link,
        status: 'success',
      }
    } catch {
      return { platform: 'GitHub repo', available: false, link, status: 'error' }
    }
  },

  'GitHub org/user': async (name) => {
    const link = `https://github.com/${name}`
    try {
      const res = await fetch(`https://api.github.com/users/${name}`, {
        headers: { 'User-Agent': 'name-checker' },
      })
      return {
        platform: 'GitHub org/user',
        available: res.status === 404,
        link,
        status: 'success',
      }
    } catch {
      return { platform: 'GitHub org/user', available: false, link, status: 'error' }
    }
  },

  'npm package': async (name) => {
    const link = `https://www.npmjs.com/package/${name}`
    try {
      const res = await fetch(`https://registry.npmjs.org/${name}`)
      return {
        platform: 'npm package',
        available: res.status === 404,
        link,
        status: 'success',
      }
    } catch {
      return { platform: 'npm package', available: false, link, status: 'error' }
    }
  },

  'npm org': async (name) => {
    const link = `https://www.npmjs.com/org/${name}`
    try {
      const res = await fetch(`https://registry.npmjs.org/-/org/${name}/package`)
      return {
        platform: 'npm org',
        available: res.status === 404,
        link,
        status: 'success',
      }
    } catch {
      return { platform: 'npm org', available: false, link, status: 'error' }
    }
  },

  'PyPI package': async (name) => {
    const link = `https://pypi.org/project/${name}/`
    try {
      const res = await fetch(`https://pypi.org/pypi/${name}/json`)
      return {
        platform: 'PyPI package',
        available: res.status === 404,
        link,
        status: 'success',
      }
    } catch {
      return { platform: 'PyPI package', available: false, link, status: 'error' }
    }
  },

  'Rust crate': async (name) => {
    const link = `https://crates.io/crates/${name}`
    try {
      const res = await fetch(`https://crates.io/api/v1/crates/${name}`)
      return {
        platform: 'Rust crate',
        available: res.status === 404,
        link,
        status: 'success',
      }
    } catch {
      return { platform: 'Rust crate', available: false, link, status: 'error' }
    }
  },

  'Ruby gem': async (name) => {
    const link = `https://rubygems.org/gems/${name}`
    try {
      const res = await fetch(`https://rubygems.org/api/v1/gems/${name}.json`)
      return {
        platform: 'Ruby gem',
        available: res.status === 404,
        link,
        status: 'success',
      }
    } catch {
      return { platform: 'Ruby gem', available: false, link, status: 'error' }
    }
  },

  'Nuget package': async (name) => {
    const link = `https://www.nuget.org/packages/${name}`
    try {
      const res = await fetch(
        `https://api.nuget.org/v3/registration5-gz-semver2/${name.toLowerCase()}/index.json`
      )
      return {
        platform: 'Nuget package',
        available: res.status === 404,
        link,
        status: 'success',
      }
    } catch {
      return { platform: 'Nuget package', available: false, link, status: 'error' }
    }
  },

  'Packagist package': async (name) => {
    const link = `https://packagist.org/packages/${name}/${name}`
    try {
      const res = await fetch(`https://repo.packagist.org/p2/${name}/${name}.json`)
      return {
        platform: 'Packagist package',
        available: res.status === 404,
        link,
        status: 'success',
      }
    } catch {
      return { platform: 'Packagist package', available: false, link, status: 'error' }
    }
  },

  'Go package': async (name) => {
    const link = `https://pkg.go.dev/github.com/${name}/${name}`
    try {
      const res = await fetch(`https://proxy.golang.org/github.com/${name}/${name}/@v/list`)
      const text = await res.text()
      return {
        platform: 'Go package',
        available: res.status === 404 || text.trim() === '',
        link,
        status: 'success',
      }
    } catch {
      return { platform: 'Go package', available: false, link, status: 'error' }
    }
  },

  'Homebrew cask/formula': async (name) => {
    const link = `https://formulae.brew.sh/formula/${name}`
    try {
      const [formulaRes, caskRes] = await Promise.all([
        fetch(`https://formulae.brew.sh/api/formula/${name}.json`),
        fetch(`https://formulae.brew.sh/api/cask/${name}.json`),
      ])
      return {
        platform: 'Homebrew cask/formula',
        available: formulaRes.status === 404 && caskRes.status === 404,
        link,
        status: 'success',
      }
    } catch {
      return { platform: 'Homebrew cask/formula', available: false, link, status: 'error' }
    }
  },
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const name = url.searchParams.get('name')
  const platform = url.searchParams.get('platform')

  if (!name || !platform) {
    return new Response(JSON.stringify({ error: 'Missing name or platform parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const checker = platformCheckers[platform]
  if (!checker) {
    return new Response(JSON.stringify({ error: 'Unknown platform' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const result = await checker(name)

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
