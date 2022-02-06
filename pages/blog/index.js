import fs from 'node:fs'

import { Container, Heading, List, Link, ListItem, Tag } from '@chakra-ui/react'

const sposts = [
  {
    title: 'GSoC 2020 MIT App Inventor Project VCE',
    slug: 'gsoc-2020-mit-app-inventor-project-vce',
  },
  {
    title: 'MD Test',
    slug: 'md-test',
  }
]

export default function Blog({ posts }) {
  return (
    <Container>
      <Heading as="h1" py={8}>Blog <Tag colorScheme="purple" fontWeight="bold">{sposts.length}</Tag></Heading>
      <List>
        {sposts.map((post, i) => (
          <ListItem key={i} borderBottom="1px" py={8}>
            <BlogPostCard post={post} />
          </ListItem>
        ))}
      </List>
    </Container>
  )
}

function BlogPostCard({ post }) {
  return (
    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
  )
}

export async function getStaticProps() {
  const files = fs.readdirSync('./pages/blog', 'utf-8')

  const mdxFiles = files
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace('.mdx', ''))

  console.log('Found mdx files:', mdxFiles)

  return {
    props: {
      posts: mdxFiles.map((f, c) => ({
        slug: f
      }))
    }
  }
}