import { faGithub, faLinkedin, faReddit, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Head from 'next/head'
import Image from 'next/image'
import Button from '../components/Button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Head>
        <title>{"Pavitra's Metaverse"}</title>
        <meta name="description" content="Pavitra's Metaverse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-16 text-center min-h-screen">
        <h1 className="text-6xl leading-normal font-bold">
          Welcome to <a href="#" className="text-blue-500 hover:underline">my Metaverse</a>
        </h1>

        <p className="my-16 text-2xl">
          Metaverse currently in development.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Button url="/blog">Blog</Button>
          <Button>About</Button>
          <Button url="#projects">Projects</Button>
          <Button>Portfolio</Button>
        </div>

      </main>

      <section id="projects" className="grid grid-cols-1 md:grid-cols-2 bg-redd-500 bg-black w-full p-16">
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 font-bold text-4xl">My Projects</div>
        <div className="grid grid-cols-2 gap-8">
          <ProjectCard icon="/icon-192.png" title="Lorem Ipsum" description="Lorem Ipsum dolor sit amet" url="#" />
          <ProjectCard icon="/icon-192.png" title="Lorem Ipsum" description="Lorem Ipsum dolor sit amet" url="#" />
          <ProjectCard icon="/icon-192.png" title="Lorem Ipsum" description="Lorem Ipsum dolor sit amet" url="#" />
          <ProjectCard icon="/icon-192.png" title="Lorem Ipsum" description="Lorem Ipsum dolor sit amet" url="#" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 bg-redd-500 bg-black w-full p-16">
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 font-bold text-4xl">Connect with me</div>
        <div className="grid grid-cols-2 gap-16">
          <SocialButton icon={faTwitter} title="Twitter" url="https://twitter.com/PavitraGolchha" />
          <SocialButton icon={faGithub} title="GitHub" url="https://github.com/pavi2410" />
          <SocialButton icon={faLinkedin} title="LinkedIn" url="https://linkedin.com/in/pavi2410" />
          <SocialButton icon={faEnvelope} title="Email" url="mailto://hello@pavi2410.me" />
        </div>
      </section>
    </div>
  )
}

function ProjectCard({ icon, title, description, url }) {
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <div className="bg-white p-2 rounded flex">
        <div>
          <Image src={icon} alt={title} width="128" height="128" />
        </div>
        <div>
          <p>{title}</p>
          <p>{description}</p>
        </div>
      </div>
    </a>
  )
}


function SocialButton({ icon, title, url }) {
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <div className="bg-white p-2 rounded">
        <FontAwesomeIcon icon={icon} />
        {' ' + title}
      </div>
    </a>
  )
}
