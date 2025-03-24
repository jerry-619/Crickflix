import { Box, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { FiSun, FiMoon } from 'react-icons/fi';

const ColorModeToggle = () => {
  const { toggleColorMode, colorMode } = useColorMode();
  const iconColor = useColorModeValue('orange.500', 'yellow.300');
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const toggleBg = useColorModeValue('white', 'gray.800');

  return (
    <Box
      onClick={toggleColorMode}
      cursor="pointer"
      borderRadius="full"
      bg={bgColor}
      p={1}
      w="60px"
      h="30px"
      position="relative"
      transition="all 0.2s ease"
      _hover={{ opacity: 0.8 }}
    >
      {/* Track */}
      <Box
        position="absolute"
        left={colorMode === 'light' ? '2px' : 'calc(100% - 28px)'}
        top="2px"
        bg={toggleBg}
        borderRadius="full"
        w="26px"
        h="26px"
        transition="all 0.2s ease"
        transform={`translateX(${colorMode === 'light' ? '0' : '-2px'})`}
        boxShadow="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {/* Icon */}
        {colorMode === 'light' ? (
          <FiSun size={16} color="#ED8936" />
        ) : (
          <FiMoon size={16} color="#ECC94B" />
        )}
      </Box>
    </Box>
  );
};

export default ColorModeToggle; 