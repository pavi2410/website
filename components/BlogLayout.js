import Head from "next/head"
import Image from 'next/image'
import { MDXProvider } from '@mdx-js/react'
import { Heading, Text, Code, Tag, Container, List, UnorderedList, OrderedList, Wrap } from "@chakra-ui/react"
import { pickColorSchemeByStringHash } from "./util"

const ResponsiveImage = (props) => (
  <Image alt={props.alt} layout="responsive" {...props} />
)

const components = {
  // img: ResponsiveImage,
  h1: (props) => <Heading as="h1" size="2xl" fontWeight="900" lineHeight="1.1" py={8} {...props} />,
  h2: (props) => <Heading as="h2" size="xl" fontWeight="700" lineHeight="1.1" py={4} {...props} />,
  h3: (props) => <Heading as="h3" fontSize="xl" {...props} />,
  p: (props) => <Text lineHeight="md" fontSize="xl" {...props} />,
  // code: Pre,
  code: (props) => <Code colorScheme="purple" px={2} py={1} {...props} />,
  li: List,
  ol: OrderedList,
  ul: UnorderedList,
}

export default function BlogLayout({ meta, children }) {
  return (
    <Container maxW="4xl">
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description || meta.title} />
      </Head>
      <Heading as="h1" size="2xl" fontWeight="900" lineHeight="1.1" py={8}>{meta.title}</Heading>
      <MDXProvider components={components}>
        {children}
      </MDXProvider>
      Tags: <Wrap>{meta.tags.map((tag, i) => <Tag key={i} colorScheme={pickColorSchemeByStringHash(tag)}>{tag}</Tag>)}</Wrap>
      <p>Published on {formatDate(meta.createdAt)}</p>
      <p>Last updated at {formatDate(meta.updatedAt)}</p>
    </Container>
  )
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' })
}