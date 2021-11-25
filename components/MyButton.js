import { Link, Button } from "@chakra-ui/react";

export default function MyButton({ url = "#", children, ...props }) {
  return (
    <Link href={url}>
      <Button {...props}>{children}</Button>
    </Link>
  )
}