import Head from 'next/head'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <Head>
        <title>{"Pavitra's Metaverse"}</title>
        <meta name="description" content="Pavitra's Metaverse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-16 text-center">

        <h1 className="text-6xl leading-normal font-bold">
          Welcome to <a href="#" className="text-blue-500 hover:underline">my Metaverse</a>
        </h1>

        <p className="my-16 text-2xl">
          Metaverse currently in development.
        </p>

      </main>
    </div>
  )
}
