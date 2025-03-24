import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Link,
  Container,
  IconButton,
  useDisclosure,
  Stack,
  Text,
  Collapse,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import ColorModeToggle from './ColorModeToggle';

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  return (
    <Box bg={bgColor} px={4} position="sticky" top={0} zIndex={1000} borderBottom="1px" borderColor={borderColor}>
      <Container maxW="7xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Link
            as={RouterLink}
            to="/"
            _hover={{ textDecoration: 'none' }}
          >
            <Flex align="center" pt={1}>
              <Image src="/logo.png" alt="CrickFlix Logo" h="62px" objectFit="contain" />
            </Flex>
          </Link>

          {/* Desktop Navigation */}
          <Stack
            direction="row"
            spacing={8}
            align="center"
            display={{ base: 'none', md: 'flex' }}
          >
            <Link
              as={RouterLink}
              to="/"
              color={textColor}
              fontWeight="medium"
              _hover={{ color: 'brand.400' }}
            >
              Home
            </Link>
            <Link
              as={RouterLink}
              to="/categories"
              color={textColor}
              fontWeight="medium"
              _hover={{ color: 'brand.400' }}
            >
              Categories
            </Link>
            <Link
              as={RouterLink}
              to="/live"
              color={textColor}
              fontWeight="medium"
              _hover={{ color: 'brand.400' }}
            >
              Live Matches
            </Link>
            <Link
              as={RouterLink}
              to="/blogs"
              color={textColor}
              fontWeight="medium"
              _hover={{ color: 'brand.400' }}
            >
              Blogs
            </Link>
            <ColorModeToggle />
          </Stack>

          {/* Mobile Menu Button */}
          <Flex display={{ base: 'flex', md: 'none' }} align="center" gap={4}>
            <ColorModeToggle />
            <IconButton
              onClick={onToggle}
              icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
              variant="ghost"
              color={textColor}
              aria-label="Toggle Navigation"
              _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.200') }}
            />
          </Flex>
        </Flex>

        {/* Mobile Navigation */}
        <Collapse in={isOpen} animateOpacity>
          <Stack
            bg={bgColor}
            p={4}
            display={{ md: 'none' }}
            spacing={4}
            direction="column"
            align="start"
            w="100%"
            position="absolute"
            left={0}
            top="64px"
            zIndex={2}
            borderTop="1px"
            borderColor={borderColor}
            shadow="lg"
          >
            <Link
              as={RouterLink}
              to="/"
              color={textColor}
              fontWeight="medium"
              w="100%"
              p={2}
              _hover={{ 
                color: 'brand.400',
                bg: useColorModeValue('gray.100', 'whiteAlpha.100')
              }}
            >
              Home
            </Link>
            <Link
              as={RouterLink}
              to="/categories"
              color={textColor}
              fontWeight="medium"
              w="100%"
              p={2}
              _hover={{ 
                color: 'brand.400',
                bg: useColorModeValue('gray.100', 'whiteAlpha.100')
              }}
            >
              Categories
            </Link>
            <Link
              as={RouterLink}
              to="/live"
              color={textColor}
              fontWeight="medium"
              w="100%"
              p={2}
              _hover={{ 
                color: 'brand.400',
                bg: useColorModeValue('gray.100', 'whiteAlpha.100')
              }}
            >
              Live Matches
            </Link>
            <Link
              as={RouterLink}
              to="/blogs"
              color={textColor}
              fontWeight="medium"
              w="100%"
              p={2}
              _hover={{ 
                color: 'brand.400',
                bg: useColorModeValue('gray.100', 'whiteAlpha.100')
              }}
            >
              Blogs
            </Link>
          </Stack>
        </Collapse>
      </Container>
    </Box>
  );
};

export default Navbar;