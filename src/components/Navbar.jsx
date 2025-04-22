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
  HStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { FaQuestionCircle, FaHome, FaList, FaPlay, FaBlog } from 'react-icons/fa';
import ColorModeToggle from './ColorModeToggle';
import { useEffect } from 'react';

const popOutKeyframes = keyframes`
  0% { 
    transform: scale(1) translateY(0);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1) translateY(-8px);
    opacity: 0.9;
  }
  100% { 
    transform: scale(1.05) translateY(-4px);
    opacity: 1;
  }
`;

const Navbar = () => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const activeColor = useColorModeValue('brand.500', 'brand.200');
  const activeGlow = useColorModeValue(
    '0 4px 15px rgba(49, 130, 206, 0.5)',
    '0 4px 15px rgba(154, 230, 180, 0.5)'
  );
  const mobileNavBg = useColorModeValue(
    'rgba(255, 255, 255, 0.7)',
    'rgba(26, 32, 44, 0.75)'
  );
  const glassHighlight = useColorModeValue(
    'rgba(255, 255, 255, 0.3)',
    'rgba(255, 255, 255, 0.1)'
  );
  const glassShadow = useColorModeValue(
    '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
  );

  const popOutAnimation = `${popOutKeyframes} 0.3s ease forwards`;

  // Close menu when route changes
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const navItems = [
    { name: 'Home', path: '/', icon: FaHome },
    { name: 'Categories', path: '/categories', icon: FaList },
    { name: 'Live', path: '/live', icon: FaPlay },
    { name: 'Blogs', path: '/blogs', icon: FaBlog },
    { name: 'Help', path: '/help', icon: FaQuestionCircle },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navigation - Top Bar */}
      <Box 
        as="header"
        bg={bgColor} 
        position="sticky" 
        top={0}
        zIndex={1000} 
        borderBottom="1px" 
        borderColor={borderColor}
        backdropFilter="blur(10px)"
        mb={0}
      >
        <Container maxW="7xl">
          <Flex h="64px" alignItems="center" justifyContent="space-between">
            {/* Logo */}
            <Link
              as={RouterLink}
              to="/"
              _hover={{ textDecoration: 'none' }}
            >
              <Flex align="center">
                <Image src="/logo.png" alt="CrickFlix Logo" h="50px" objectFit="contain" />
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
                  {item.name}
                </Link>
              ))}
              <ColorModeToggle />
            </Stack>

            {/* Mobile Color Toggle */}
            <Box display={{ base: 'block', md: 'none' }}>
              <ColorModeToggle />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Mobile Navigation - Bottom Bar */}
      <Box
        as="nav"
        display={{ base: 'block', md: 'none' }}
        position="fixed"
        bottom={{ base: 2, sm: 4 }}
        left={{ base: 2, sm: 4 }}
        right={{ base: 2, sm: 4 }}
        zIndex={1000}
      >
        <Box
          bg={mobileNavBg}
          borderRadius="full"
          backdropFilter="blur(16px) saturate(180%)"
          boxShadow={glassShadow}
          border="1px solid"
          borderColor={glassHighlight}
          px={{ base: 2, sm: 4 }}
          py={{ base: 1, sm: 2 }}
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'full',
            padding: '1px',
            background: `linear-gradient(225deg, ${glassHighlight}, transparent)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none'
          }}
        >
          <HStack justify="space-around" spacing={{ base: 0, sm: 2 }}>
            {navItems.map((item, index) => {
              const isActiveItem = isActive(item.path);
              return (
                <Link
                  key={index}
                  as={RouterLink}
                  to={item.path}
                  py={{ base: 2, sm: 2 }}
                  px={{ base: 1, sm: 3 }}
                  borderRadius="full"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={{ base: 0.5, sm: 1 }}
                  color={isActiveItem ? activeColor : textColor}
                  position="relative"
                  transition="all 0.3s ease"
                  flex={1}
                  textAlign="center"
                  zIndex={1}
                  minW={0}
                  animation={isActiveItem ? popOutAnimation : undefined}
                  style={{
                    transform: isActiveItem ? 'scale(1.05) translateY(-4px)' : 'scale(1) translateY(0)'
                  }}
                  _hover={{
                    textDecoration: 'none',
                    color: activeColor,
                    transform: 'scale(1.05) translateY(-4px)',
                  }}
                  sx={{
                    '&::after': {}
                  }}
                >
                  <Box 
                    as={item.icon} 
                    fontSize={{ base: "1.1em", sm: "1.3em" }}
                  />
                  <Text 
                    fontSize={{ base: "2xs", sm: "xs" }}
                    fontWeight="medium"
                    noOfLines={1}
                  >
                    {item.name}
                  </Text>
                </Link>
              );
            })}
          </HStack>
        </Box>
      </Box>
    </>
  );
};

export default Navbar;