import { faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Head from 'next/head'
import Image from 'next/image'
import { chakra, Container, Button, SimpleGrid, HStack, VStack, Heading, Text, Badge, Wrap } from "@chakra-ui/react"
import Bg from '../components/Bg'

function MyHead() {
  return (
    <Head>
      <title>{"Pavitra's Metaverse"}</title>
      <meta name="description" content="Pavitra's Metaverse" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  )
}

export default function Home() {
  return (
    <div>
      <MyHead />

      <Bg />

      <chakra.div p={8}>
        <Container maxW="4xl" textAlign="center">
          <VStack spacing={16}>
            <Heading as="h1" size="3xl">
              Welcome to my <Text as="span" color="blue.500">Metaverse</Text>
            </Heading>

            <Text fontSize="2xl">
              Metaverse currently in development.
            </Text>

            {/* <Center> */}
            <SimpleGrid columns={2} spacing={8}>
              <Button size="lg" url="/blog">Blog</Button>
              <Button size="lg">About</Button>
              <Button size="lg" url="#projects">Projects</Button>
              <Button size="lg">Portfolio</Button>
            </SimpleGrid>
            {/* </Center> */}
          </VStack>
        </Container>

        <Container maxW="4xl">
          <Heading py={8}>My Projects</Heading>
          <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={8}>
            <ProjectCard icon="/icon-192.png" title="Kodular" description="Lorem Ipsum dolor sit amet" url="#" techStack={['Android', 'Java']} />
            <ProjectCard icon="/icon-192.png" title="VR Compatibility Checker" description="Lorem Ipsum dolor sit amet" url="#" techStack={['Android', 'Kotlin', 'Compose']} />
            <ProjectCard icon="/icon-192.png" title="picsup" description="Lorem Ipsum dolor sit amet" url="#" techStack={['FullStack', 'Web', 'Javascript', 'React']} />
            <ProjectCard icon="/icon-192.png" title="REPLisp" description="Lorem Ipsum dolor sit amet" url="#" techStack={['C', 'LISP', 'Programming Language', 'Interpreter']} />
          </SimpleGrid>
        </Container>

        <Container maxW="4xl">
          <Heading py={8}>Connect with me</Heading>
          <SimpleGrid columns={{ sm: 2, md: 4 }} spacing={8}>
            <SocialButton icon={faTwitter} title="Twitter" url="https://twitter.com/PavitraGolchha" color="twitter" />
            <SocialButton icon={faGithub} title="GitHub" url="https://github.com/pavi2410" color="blackAlpha" />
            <SocialButton icon={faLinkedin} title="LinkedIn" url="https://linkedin.com/in/pavi2410" color="linkedin" />
            <SocialButton icon={faEnvelope} title="Email" url="mailto://hello@pavi2410.me" color="red" />
          </SimpleGrid>
        </Container>
      </chakra.div>
    </div>
  )
}

function ProjectCard({ icon, title, description, url, techStack }) {
  return (
    <HStack maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white">
      <chakra.div p={4}>
        <Image src={icon} alt={title} width="96" height="96" layout="fixed" />
      </chakra.div>
      <VStack align="flex-start" py={2} pr={2}>
        <Text fontSize="2xl" fontWeight="bold" lineHeight="1">{title}</Text>
        <Text>{description}</Text>
        <Wrap>
          {techStack.map((tech, i) => (
            <Badge variant="subtle" colorScheme={['red', 'green', 'blue', 'yellow', 'purple'][i % 5]} key={i}>{tech}</Badge>
          ))}
        </Wrap>
      </VStack>
    </HStack>
  )
}


function SocialButton({ icon, title, url, color }) {
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <Button colorScheme={color} leftIcon={<FontAwesomeIcon icon={icon} />}>
        {title}
      </Button>
    </a>
  )
}
