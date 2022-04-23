import { Heading, Text, Code, Tag, ListItem, UnorderedList, OrderedList, Alert, Center, Badge, Link, Table, Thead, Tbody, Tr, Td, Th, Image, Divider } from "@chakra-ui/react"
import { pickColorSchemeByStringHash } from "../util/util"
import SyntaxHighlighter from "react-syntax-highlighter"
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'

export const components = {
  // img: ResponsiveImage,
  h1: props => <Heading as="h1" size="2xl" py={4} {...props} />,
  h2: props => <Heading as="h2" size="xl" py={4} {...props} textDecoration="springgreen underline .3rem" />,
  h3: props => <Heading as="h3" size="lg" py={4} {...props} textDecoration="deepskyblue underline .2rem" />,
  h4: props => <Heading as="h4" size="md" py={4} {...props} />,
  h5: props => <Heading as="h5" size="sm" py={4} {...props} />,
  h6: props => <Heading as="h6" size="xs" py={4} {...props} />,
  p: props => <Text fontSize="xl" py={4} lineHeight={2} color="gray.600" {...props} />,
  blockquote: props => <Alert status="info" variant="left-accent" colorScheme="zinc" rounded="lg" alignItems="start" py={-2} style={{ flexDirection: 'column' }} {...props} />,
  pre: props => {
    const { children, className } = props.children.props
    const code = children.replace(/^\s+|\s+$/g, '')
    const language = className?.replace(/language-/, '')
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
  code: props => <Code colorScheme="blue" letterSpacing="1px" px={2} py={.3} {...props} />,
  li: props => <ListItem {...props} />,
  ol: props => <OrderedList size="lg" {...props} />,
  ul: props => <UnorderedList spacing={2} fontSize="xl" lineHeight="md" pb={4} {...props} />,
  a: props => <Link color="blue.600" textDecoration="underline" {...props} />,
  hr: props => <Divider py={2} />,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  td: Td,
  th: Th,
  Badge: props => <Badge colorScheme="red">{props.text}</Badge>,
  Tag: props => <Tag fontWeight="700" colorScheme={pickColorSchemeByStringHash(props.text)}>{props.text}</Tag>,
  img: props => <Center><Image alt={props.alt} src={props.src} {...props} /></Center>,
  Image: props => <Center><Image alt={props.alt} {...props} /></Center>,
  wrapper: props => <div hi {...props} />
}