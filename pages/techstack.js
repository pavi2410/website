import { chakra, Button, Container, Heading, HStack, VStack, Grid, GridItem, Center, Text, Wrap } from "@chakra-ui/react";
import { SiChakraui, SiKotlin, SiPrisma, SiSupabase, SiVite, SiMaterialdesign, SiWindows, SiWindowsterminal, SiJetbrains, SiDocker, SiVisualstudiocode, SiFirefoxbrowser, SiGitkraken, SiLinux, SiInsomnia, SiExpress, SiReacttable, SiReact, SiIcons8, SiHtml5, SiCss3, SiJavascript, SiAndroid, SiNodedotjs } from 'react-icons/si';
import { FaTerminal } from "react-icons/fa";
import { AiOutlineApi } from 'react-icons/ai';

const techStacks = {
  Frontend: () => (
    <>
      <StackCell colSpan={3} bg='teal.300' icon={<SiChakraui />} title="Chakra UI" />
      <StackCell colSpan={3} bg='red.300' icon={<SiReacttable />} title="React Query" />
      <StackCell colSpan={3} color="white" bg='purple.400' icon={<SiReact />} title="React" />
      <StackCell colSpan={3} color="white" bg='violet' icon={<SiVite />} title="Vite" />
      <StackCell colSpan={2} color="white" bg='tomato' icon={<SiHtml5 />} title="HTML" />
      <StackCell colSpan={2} color="white" bg='blue.400' icon={<SiCss3 />} title="CSS" />
      <StackCell colSpan={2} color="black" bg='yellow.300' icon={<SiJavascript />} title="JS" />
    </>
  ),
  Backend: () => (
    <>
      <StackCell colSpan={2} color="white" bg='red.400' icon={<AiOutlineApi />} title="REST API" />
      <StackCell colSpan={2} color="white" bg='purple.400' icon={<SiPrisma />} title="JWT" />
      <StackCell colSpan={3} color="white" bg='slate.400' icon={<SiPrisma />} title="Prisma" />
      <StackCell colSpan={3} color="white" bg='green.400' icon={<SiSupabase />} title="Supabase" />
      <StackCell colSpan={6} color="white" bg='blue.400' icon={<SiExpress />} title="Express JS" />
      <StackCell colSpan={6} color="black" bg='green.400' icon={<SiNodedotjs />} title="Node JS" />
    </>
  ),
  Android: () => (
    <>
      <StackCell colSpan={2} color="white" bg='violet.500' icon={<SiMaterialdesign />} title="Material Design" />
      <StackCell colSpan={2} color="white" bg='orange.400' icon={<SiKotlin />} title="Ktor" />
      <StackCell colSpan={6} color="white" bg='green.400' icon={<SiAndroid />} title="Jetpack Compose" />
      <StackCell colSpan={3} color="white" bg='emerald.400' icon={<SiAndroid />} title="Android" />
      <StackCell colSpan={3} color="white" bg='purple.500' icon={<SiKotlin />} title="Kotlin" />
    </>
  ),
  'My Dev Env': () => (
    <>
      <StackCell colSpan={4} color="white" bg='orange.400' icon={<SiFirefoxbrowser />} title="Firefox" />
      <StackCell colSpan={2} color="white" bg='teal.500' icon={<SiGitkraken />} title="GitKraken" />
      <StackCell colSpan={2} color="white" bg='sky.400' icon={<SiIcons8 />} title="Lunacy" />
      <StackCell colSpan={2} color="white" bg='indigo.500' icon={<SiInsomnia />} title="Insomnia" />
      <StackCell colSpan={2} color="white" bg='sky.400' icon={<SiDocker />} title="Docker" />
      <StackCell colSpan={4} color="white" bg='violet.500' icon={<SiJetbrains />} title="Jetbrains IDE" />
      <StackCell colSpan={2} color="white" bg='blue.400' icon={<SiVisualstudiocode />} title="VS Code" />
      <StackCell colSpan={3} color="white" bg='gray.700' icon={<SiWindowsterminal />} title="Windows Terminal" />
      <StackCell colSpan={3} color="white" bg='orange.500' icon={<SiLinux />} title="WSL + Ubuntu" />
      <StackCell colSpan={6} color="white" bg='blue.400' icon={<SiWindows />} title="Windows" />
    </>
  )
}

export default function TechStack() {
  return (
    <Container maxW="4xl" pb={16}>
      <Heading size="2xl" py="2rem">Tech Stacks</Heading>
      <Wrap pb="4rem">
        <StackButton icon={<SiReact />} color="purple" title="Frontend" />
        <StackButton icon={<SiNodedotjs />} color="green" title="Backend" />
        <StackButton icon={<SiAndroid />} color="emerald" title="Android" />
        <StackButton icon={<FaTerminal />} color="blue" title="My Dev Env" />
      </Wrap>
      <VStack spacing={16}>
        <StackContainer title="Frontend" color="purple" icon={<SiReact />} />
        <StackContainer title="Backend" color="green" icon={<SiNodedotjs />} />
        <StackContainer title="Android" color="emerald" icon={<SiAndroid />} />
        <StackContainer title="My Dev Env" color="blue" icon={<FaTerminal />} />
      </VStack>
    </Container>
  )
}

function StackContainer({ title, color, icon }) {
  return (
    <chakra.div bg={`${color}.100`} p={4} borderRadius="1rem" w="full" id={title}>
      <HStack align="center" pb={4} color={`${color}.500`} fontSize="2xl">
        {icon}
        <Text fontWeight="bold">{title}</Text>
      </HStack>
      <Grid templateColumns='repeat(6, 1fr)' gap={4}>
        {techStacks[title]()}
      </Grid>
    </chakra.div>
  )
}

function StackCell({ colSpan, bg, icon, color, title }) {
  return (
    <GridItem colSpan={colSpan} color={color} bg={bg} borderRadius="1rem" fontSize="2xl" fontWeight="bold" h="5rem">
      <Center h="100%">{icon}&nbsp;{title}</Center>
    </GridItem>
  )
}

function StackButton({ title, icon, color }) {
  return (
    <Button as="a" href={'#' + title} leftIcon={icon} bg={`${color}.100`} color={`${color}.500`}>{title}</Button>
  )
}