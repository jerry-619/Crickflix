import { Box, Text, Container, Link, useColorModeValue } from '@chakra-ui/react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const bg = useColorModeValue('gray.100', 'gray.900');
  const color = useColorModeValue('gray.800', 'white');

  return (
    <Box
      as="footer"
      py={4}
      bg={bg}
      color={color}
      position="relative"
      bottom={0}
      width="100%"
      mt="auto"
      fontWeight={600}
      transition="all 0.2s"
    >
      <Container maxW="container.xl" centerContent>
        <Text
          fontSize={{ base: "sm", md: "md" }}
          textAlign="center"
          opacity={0.8}
          mb={1}
        >
          © {currentYear} Crickflix. All rights reserved.
        </Text>
        <Text
          fontSize={{ base: "xs", md: "sm" }}
          textAlign="center"
          opacity={0.7}
        >
          Made with ❤️ by{' '}
          <Link
            href="https://github.com/jerry-619"
            isExternal
            color="teal.500"
            _hover={{ color: 'teal.400', textDecoration: 'none' }}
          >
            Fardeen Beigh
          </Link>
        </Text>
      </Container>
    </Box>
  );
};

export default Footer; 