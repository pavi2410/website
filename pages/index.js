import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>{"Pavitra's Metaverse"}</title>
        <meta name="description" content="Pavitra's Metaverse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>

        <h1 className={styles.title}>
          Welcome to <a href="#">my Metaverse</a>
        </h1>

        <p className={styles.description}>
          Metaverse currently in development.
        </p>

      </main>
    </div>
  )
}
