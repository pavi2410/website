import fs from 'node:fs'
import { default as NextLink } from 'next/link'
import { Container, Heading, List, ListItem, Tag, LinkBox, LinkOverlay } from '@chakra-ui/react'
import { formatDate } from '/util/util'

export default function Blog({ posts }) {
  return (
    <Container>
      <Heading as="h1" py={8} textDecoration="springgreen underline .3rem">
        My Blog <Tag colorScheme="indigo" fontWeight="bold">{posts.length}</Tag>
      </Heading>
      <List>
        {posts.map((post, i) => (
          <ListItem key={i} py={4}>
            <BlogPostCard post={post} />
          </ListItem>
        ))}
      </List>
    </Container>
  )
}

function BlogPostCard({ post }) {
  return (
    <LinkBox as="article" borderWidth="1px" borderRadius="lg" p={4} _hover={{ borderColor: 'blue.500' }}>
      <Heading as="h4" size="md">
        <NextLink href={"/blog/" + post.slug} passHref>
          <LinkOverlay>
            {post.meta.title}
          </LinkOverlay>
        </NextLink>
      </Heading>
      <p>{post.meta.excerpt}</p>
      <i>{formatDate(post.meta.createdAt)}</i>
    </LinkBox>
  )
}

export async function getStaticProps() {
  const files = fs.readdirSync('./pages/blog', 'utf-8')

  const mdxFiles = files
    .filter(f => f.endsWith('.mdx'))

  const posts = await Promise.all(
    mdxFiles.map(f => (
      import('./' + f)
        .then(m => ({
          slug: f.replace('.mdx', ''),
          meta: m.meta
        }))
    ))
  )

  posts.sort((a, b) => new Date(b.meta.createdAt) - new Date(a.meta.createdAt))

  // console.log('Found mdx files:', mdxFiles)
  // console.log('Found posts:', posts)

  return {
    props: {
      posts
    }
  }
}