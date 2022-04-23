import { Link, Button } from "@chakra-ui/react";

export default function MyButton({ url = "#", children, ...props }) {
  return (
    <Link href={url}>
      <Button boxShadow="lg" _hover={{top: '-4px', boxShadow:'xl'}} {...props}>{children}</Button>
    </Link>
  )
}