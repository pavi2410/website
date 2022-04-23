import { Heading, LinkBox, LinkOverlay, Text } from '@chakra-ui/react'
import { formatDate } from '@/util/util'

export function BlogPostCard({ post }) {
  return (
    <LinkBox as="article" borderWidth="1px" borderRadius="lg" p={4} _hover={{ borderColor: 'blue.500' }}>
      <Heading as="h4" size="md">
        <a href={"/blog/" + post.slug}>
          <LinkOverlay>
            {post.meta.title}
          </LinkOverlay>
        </a>
      </Heading>
      <Text as="i">{post.meta.excerpt}</Text>
      <Text align="end">{formatDate(post.meta.createdAt)}</Text>
    </LinkBox>
  )
}