const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/
})

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/gsoc-2020-appinventor-project-vce',
        destination: '/blog/gsoc-2020-mit-app-inventor-project-vce',
        permanent: true,
      },
    ]
  },
})