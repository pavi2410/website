import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { chakra, Box, Container, Button, SimpleGrid, Stack, HStack, VStack, Heading, Text, Link, Wrap, Tag, Icon } from "@chakra-ui/react"
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa'
import Bg from '../components/Bg'
import MyButton from '../components/MyButton'
import { pickColorSchemeByStringHash } from '../components/util'
import projectsData from '/data/projects.json'

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
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setBlink(!blink)
    }, 800)

    return () => clearInterval(timer)
  })


  return (
    <div>
      <MyHead />

      <Bg />

      
        <Container maxW="4xl" textAlign="start">
          <VStack spacing={16} h="100vh" align="start" justify="center">
            <Heading as="h1" size="2xl" fontFamily="monospace">
              <Text as="span" fontFamily="monospace">Hello World!</Text>
              <br />
              {"I'm"} <Text as="span" color="green.500">Pavitra Golchha</Text>
              <br />
              and this is my <Text as="span" color="blue.500">Metaverse</Text>
              {blink && '_' || <span>&nbsp;</span>}
            </Heading>

            <Text fontSize="2xl" fontFamily="monospace">
              You can find every info about me and my works here. Enjoy your stay here :)
            </Text>

            <Wrap spacing={8}>
              <MyButton size="lg" url="/blog" colorScheme="yellow">Blog</MyButton>
              <MyButton size="lg" colorScheme="green">About</MyButton>
              <MyButton size="lg" url="#projects" colorScheme="purple">Projects</MyButton>
              <MyButton size="lg" colorScheme="blue">Portfolio</MyButton>
            </Wrap>
          </VStack>
        </Container>

        <Container maxW="4xl" id="projects">
          <Heading py={8}>My Projects <Tag colorScheme="yellow" fontWeight="bold">{projectsData.length}</Tag></Heading>
          <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={8} gridTemplateRows="masonry">
            {
              projectsData.map((project, i) => (
                <ProjectCard {...project} key={i} />
              ))
            }
          </SimpleGrid>
        </Container>

        <Container maxW="4xl" py={16}>
          <Heading py={8}>Connect with me</Heading>
          <SimpleGrid columns={{ sm: 2, md: 4 }} spacing={8}>
            <SocialButton icon={FaTwitter} title="Twitter" url="https://twitter.com/PavitraGolchha" color="twitter" />
            <SocialButton icon={FaGithub} title="GitHub" url="https://github.com/pavi2410" color="blackAlpha" />
            <SocialButton icon={FaLinkedin} title="LinkedIn" url="https://linkedin.com/in/pavi2410" color="linkedin" />
            <SocialButton icon={FaEnvelope} title="Email" url="mailto:hello@pavi2410.me" color="red" />
          </SimpleGrid>
        </Container>
    </div>
  )
}

function ProjectCard({ icon, title, description, url, techStack }) {
  return (
    <Stack direction={{ sm: 'column', md: 'row' }} maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" p={4} spacing={4} align="start" boxShadow="lg" _hover={{boxShadow:'xl'}}>
      <chakra.div>
        <Image src={icon} alt={title} width="96" height="96" layout="fixed" />
      </chakra.div>
      <VStack align="start">
        <Text fontSize="2xl" fontWeight="bold" lineHeight="1">{title}</Text>
        <Text>{description}</Text>
        <Wrap>
          {techStack.map((tech, i) => (
            <Tag variant="subtle" colorScheme={pickColorSchemeByStringHash(tech)} key={i}>{tech}</Tag>
          ))}
        </Wrap>
        <Link as={Button} href={url} isExternal variant="outline" size="lg" colorScheme="blue" alignSelf="end">View Project</Link>
      </VStack>
    </Stack>
  )
}


function SocialButton({ icon, title, url, color }) {
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <Button colorScheme={color} leftIcon={<Icon as={icon} />}>
        {title}
      </Button>
    </a>
  )
}
