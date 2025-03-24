import { Box, Flex, Heading, Link as ChakraLink, Container, IconButton, useDisclosure, VStack, HStack, Image } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';

const Header = () => {
  const { isOpen, onToggle } = useDisclosure();

  const NavLink = ({ to, children }) => (
    <ChakraLink
      as={RouterLink}
      to={to}
      px={2}
      py={1}
      rounded="md"
      _hover={{
        textDecoration: 'none',
        bg: 'teal.600',
      }}
      color="white"
      fontWeight="medium"
    >
      {children}
    </ChakraLink>
  );

  return (
    <Box as="header" bg="teal.500" position="sticky" top={0} zIndex={1000}>
      <Container maxW="full" px={4}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            <Flex alignItems="center" gap={2}>
              <Image src="/logo.png" alt="CrickFlix Logo" h="62px" w="100%" />
            </Flex>
          </ChakraLink>

          {/* Mobile Menu Button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onToggle}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            variant="ghost"
            color="white"
            aria-label="Toggle Navigation"
            _hover={{ bg: 'teal.600' }}
          />

          {/* Desktop Navigation */}
          <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/categories">Categories</NavLink>
          </HStack>
        </Flex>

        {/* Mobile Navigation */}
        <Box
          display={{ base: isOpen ? 'block' : 'none', md: 'none' }}
          pb={4}
        >
          <VStack spacing={4} align="stretch">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/category">Categories</NavLink>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Header; 