const posts = [
  {
    title: 'GSoC 2020 MIT App Inventor Project VCE',
    slug: 'gsoc-2020-mit-app-inventor-project-vce',
  }
]

export default function Blog() {
  return (
    <div className="p-4 mx-auto antialiased">
      <h1 className="leading-normal text-6xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-500">Blog</h1>
      {posts.map((post,i) => (<a href={`/blog/${post.slug}`} className="underline text-blue-500 text-lg" key={i}>{post.title}</a>))}
    </div>
  )
}