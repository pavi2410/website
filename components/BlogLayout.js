import Head from "next/head"

export default function BlogLayout({ meta, children }) {
  return (
    <div className="px-4 py-10 max-w-3xl mx-auto sm:px-6 sm:py-12 lg:max-w-4xl lg:py-16 lg:px-8 xl:max-w-6xl antialiased">
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description || meta.title} />
      </Head>
      <h1 className="text-7xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-500">{meta.title}</h1>
      <div className="prose lg:prose-lg xl:prose-xl 2xl:prose-2xl mx-auto">
        {children}
      </div>
      Tags: {meta.tags.map((tag, i) => <div key={i} className="inline p-2">{tag}</div>)}
      <p>Last updated at {formatDate(meta.updatedAt)}</p>
    </div>
  )
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' })
}