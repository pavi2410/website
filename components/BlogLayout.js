import Head from "next/head"
import { default as NextLink } from "next/link"
import { MDXProvider } from '@mdx-js/react'
import { Heading, Tag, Icon, Container, Wrap, Link } from "@chakra-ui/react"
import { FaTags, FaArrowLeft } from 'react-icons/fa'
import { formatDate, pickColorSchemeByStringHash } from "/util/util"
import { components } from "./MdxComponents"

export default function BlogLayout({ meta, children }) {
  return (
    <Container maxW="4xl" py={8}>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description || meta.title} />
      </Head>
      <NextLink href='/blog' passHref>
        <Link><Icon as={FaArrowLeft} /> Back to blog list</Link>
      </NextLink>
      <Heading as="h1" size="2xl" fontWeight="900" lineHeight="1.3" py={4} pb={8}>{meta.title}</Heading>
      <p><b>Pavitra Golchha</b> • <i>Published on</i> {formatDate(meta.createdAt)}</p>
      <Wrap py={8} align="center">
        <Icon as={FaTags} color="neutral.700" />
        {meta.tags.map((tag, i) => <Tag key={i} colorScheme={pickColorSchemeByStringHash(tag)}>{tag}</Tag>)}
      </Wrap>
      <MDXProvider components={components}>
        {children}
      </MDXProvider>
    </Container>
  )
}