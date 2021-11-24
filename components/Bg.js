import { Box, useColorModeValue } from "@chakra-ui/react";

export default function Bg() {
  return (
    <Box zIndex="-99" position="absolute" width="100%" height="100%">
      <Box
        bgGradient={useColorModeValue(
          'radial(gray.600 1px, transparent 1px)',
          'radial(gray.300 1px, transparent 1px)'
        )}
        backgroundSize="20px 20px"
        opacity="0.4"
        height="100%" />
    </Box>
  )
}