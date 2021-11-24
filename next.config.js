const withPlugins = require('next-compose-plugins')

const mdx = require('@next/mdx')({
  extension: /\.mdx?$/
})

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/gsoc-2020-appinventor-project-vce',
        destination: '/blog/gsoc-2020-mit-app-inventor-project-vce',
        permanent: true,
      },
    ]
  },
}

module.exports = withPlugins(
  [
    mdx
  ],
  nextConfig
)