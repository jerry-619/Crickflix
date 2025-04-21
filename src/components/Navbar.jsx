import { Link as RouterLink, useLocation } from 'react-router-dom';
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
  VStack,
  Divider,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { FaQuestionCircle, FaHome, FaList, FaPlay, FaBlog } from 'react-icons/fa';
import ColorModeToggle from './ColorModeToggle';
import { useEffect } from 'react';

const Navbar = () => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const mobileMenuBg = useColorModeValue('rgba(255, 255, 255, 0.97)', 'rgba(26, 32, 44, 0.97)');
  const mobileItemHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  // Close menu when route changes
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const navItems = [
    { name: 'Home', path: '/', icon: FaHome },
    { name: 'Categories', path: '/categories', icon: FaList },
    { name: 'Live Matches', path: '/live', icon: FaPlay },
    { name: 'Blogs', path: '/blogs', icon: FaBlog },
    { name: 'Help Center', path: '/help', icon: FaQuestionCircle },
  ];

  return (
    <Box bg={bgColor} px={4} position="sticky" top={0} zIndex={1000} borderBottom="1px" borderColor={borderColor}>
      <Container maxW="7xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Link
            as={RouterLink}
            to="/"
            _hover={{ textDecoration: 'none' }}
            onClick={onClose}
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
            {navItems.map((item, index) => (
              <Link
                key={index}
                as={RouterLink}
                to={item.path}
                color={textColor}
                fontWeight="medium"
                display="flex"
                alignItems="center"
                gap={1}
                _hover={{ color: 'brand.400' }}
              >
                <Box as={item.icon} />
                {item.name === 'Help Center' ? 'Help' : item.name}
              </Link>
            ))}
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
          <VStack
            bg={mobileMenuBg}
            display={{ md: 'none' }}
            spacing={0}
            align="stretch"
            position="absolute"
            left={0}
            right={0}
            top="64px"
            borderTop="1px"
            borderColor={borderColor}
            backdropFilter="blur(10px)"
            shadow="lg"
          >
            {navItems.map((item, index) => (
              <Box key={index}>
                <Link
                  as={RouterLink}
                  to={item.path}
                  w="100%"
                  display="flex"
                  alignItems="center"
                  gap={3}
                  p={4}
                  color={textColor}
                  fontWeight="500"
                  onClick={onClose}
                  _hover={{
                    textDecoration: 'none',
                    bg: mobileItemHoverBg,
                    color: 'brand.400',
                  }}
                  transition="all 0.2s"
                >
                  <Box as={item.icon} fontSize="1.2em" />
                  {item.name}
                </Link>
                {index < navItems.length - 1 && (
                  <Divider borderColor={borderColor} opacity={0.5} />
                )}
              </Box>
            ))}
          </VStack>
        </Collapse>
      </Container>
    </Box>
  );
};

export default Navbar;