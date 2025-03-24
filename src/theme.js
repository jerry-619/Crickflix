import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.100',
        borderRadius: 'full',
      },
      '::-webkit-scrollbar-thumb': {
        bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
        borderRadius: 'full',
        border: '2px solid transparent',
        backgroundClip: 'content-box',
        '&:hover': {
          bg: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
        },
      },
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: props.colorMode === 'dark' 
          ? 'var(--chakra-colors-gray-600) var(--chakra-colors-gray-800)' 
          : 'var(--chakra-colors-gray-300) var(--chakra-colors-gray-100)',
      },
    }),
  },
  colors: {
    brand: {
      50: '#E6F6FF',
      100: '#BAE3FF',
      200: '#7CC4FA',
      300: '#47A3F3',
      400: '#2186EB',
      500: '#0967D2',
      600: '#0552B5',
      700: '#03449E',
      800: '#01337D',
      900: '#002159',
    },
  },
});

export default theme; 