import { Box, Text, Link, useColorModeValue } from '@chakra-ui/react';

const Footer = () => {
  // Define colors based on the current color mode
  const bgColor = useColorModeValue('gray.200', 'gray.800'); // Light mode: gray.200, Dark mode: gray.800
  const textColor = useColorModeValue('gray.800', 'white'); // Light mode: gray.800, Dark mode: white

  return (
    <Box as="footer" py={4} textAlign="center" bg={bgColor} color={textColor}>
      <Text>
        &copy; 2025 Crickflix, Made with ❤️ by{' '}
        <Link href="https://t.me/btw_69" isExternal color="teal.500">
          Fardeen Beigh
        </Link>
      </Text>
    </Box>
  );
};

export default Footer; 