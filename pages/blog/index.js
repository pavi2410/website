import fs from 'node:fs'

const posts = [
  {
    title: 'GSoC 2020 MIT App Inventor Project VCE',
    slug: 'gsoc-2020-mit-app-inventor-project-vce',
  }
]

export default function Blog({ paths }) {
  return (
    <div className="p-4 mx-auto antialiased">
      <h1 className="leading-normal text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-500">Blog</h1>
      {posts.map((post, i) => (
        <a href={`/blog/${post.slug}`} className="underline text-blue-500 text-lg" key={i}>{post.title}</a>
      ))}
    </div>
  )
}

export async function getStaticProps() {
  const files = fs.readdirSync('.', 'utf-8')

  const mdxFiles = files
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace('.mdx', ''))

  return {
    props: {
      paths: mdxFiles.map((f, c) => ({
        slug: f
      }))
    }
  }
}