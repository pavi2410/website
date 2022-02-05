import Head from "next/head"
import Image from 'next/image'
import { MDXProvider } from '@mdx-js/react'
import { Heading, Text, Code, Tag, Icon, Container, ListItem, UnorderedList, OrderedList, Wrap, Alert, Center, Badge, Link, Table, Thead, Tbody, Tr, Td, Th } from "@chakra-ui/react"
import { FaTags, FaArrowLeft } from 'react-icons/fa'
import { pickColorSchemeByStringHash } from "../util/util"
import SyntaxHighlighter from "react-syntax-highlighter"
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'

const components = {
  // img: ResponsiveImage,
  h1: props => <Heading as="h1" size="2xl" py={4} {...props} />,
  h2: props => <Heading as="h2" size="xl" py={4} {...props} textDecoration="springgreen underline .3rem" />,
  h3: props => <Heading as="h3" size="lg" py={4} {...props} textDecoration="deepskyblue underline .2rem" />,
  h4: props => <Heading as="h4" size="md" py={4} {...props} />,
  h5: props => <Heading as="h5" size="sm" py={4} {...props} />,
  h6: props => <Heading as="h6" size="xs" py={4} {...props} />,
  p: props => <Text fontSize="xl" pb={4} color="gray.600" {...props} />,
  blockquote: props => <Alert status="info" variant="left-accent" colorScheme="purple" rounded="lg" alignItems="start" style={{ flexDirection: 'column' }} {...props} />,
  pre: props => {
    const { children, className } = props.children.props
    const code = children.replace(/^\s+|\s+$/g, '')
    const language = className.replace(/language-/, '')
    return (
      <SyntaxHighlighter
        language={language}
        showLineNumbers
        style={atomOneDark}
        customStyle={{ fontSize: '1rem', borderRadius: '.5rem' }}
      >
        {code}
      </SyntaxHighlighter>
    )
  },
  code: props => <Code colorScheme="purple" px={2} py={1} {...props} />,
  li: props => <ListItem {...props} />,
  ol: props => <OrderedList size="lg" {...props} />,
  ul: props => <UnorderedList spacing={2} fontSize="xl" lineHeight="md" pb={4} {...props} />,
  a: props => <Link color="blue.600" textDecoration="underline" {...props} />,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  td: Td,
  th: Th,
  Badge: props => <Badge colorScheme="red">{props.text}</Badge>,
  Tag: props => <Tag fontWeight="700" colorScheme={pickColorSchemeByStringHash(props.text)}>{props.text}</Tag>,
  Image: props => <Center><Image alt={props.alt} {...props} /></Center>
}

export default function BlogLayout({ meta, children }) {
  return (
    <Container maxW="4xl" py={8}>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description || meta.title} />
      </Head>
      <Link href="/blog"><Icon as={FaArrowLeft} /> Back to blog list</Link>
      <Heading as="h1" size="2xl" fontWeight="900" lineHeight="1.3" py={4} pb={8}>{meta.title}</Heading>
      <MDXProvider components={components}>
        {children}
      </MDXProvider>
      <Wrap pt={8} align="center"><Icon as={FaTags} /> {meta.tags.map((tag, i) => <Tag key={i} colorScheme={pickColorSchemeByStringHash(tag)}>{tag}</Tag>)}</Wrap>
      <p>Published on {formatDate(meta.createdAt)}</p>
      <p>Last updated at {formatDate(meta.updatedAt)}</p>
    </Container>
  )
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' })
}