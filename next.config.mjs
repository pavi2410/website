import withPlugins from 'next-compose-plugins'
import withMdx from '@next/mdx'
import remarkGfm from 'remark-gfm'

const mdx = withMdx({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    providerImportSource: '@mdx-js/react',
  }
})

const nextConfig = {
  experimental: { esmExternals: true },
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['img.shields.io'],
  },
  async redirects() {
    return [
      {
        source: '/gsoc-2020-appinventor-project-vce',
        destination: '/blog/gsoc-2020-mit-app-inventor-project-vce',
        permanent: true,
      },
      {
        source: '/privacy_policy',
        destination: 'https://pavi2410.github.io/privacy_policy',
        permanent: false,
      },
      {
        source: '/privacy_policy/:path',
        destination: 'https://pavi2410.github.io/privacy_policy/:path',
        permanent: false,
      }
    ]
  },
}

export default withPlugins(
  [
    mdx
  ],
  nextConfig
)