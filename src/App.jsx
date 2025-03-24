import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import CategoryPage from './pages/CategoryPage';
import MatchPlayer from './pages/MatchPlayer';
import Categories from './pages/Categories';
import LiveMatches from './pages/LiveMatches';
import Footer from './components/Footer';
import { SocketProvider } from './context/SocketContext';

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

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <SocketProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/live" element={<LiveMatches />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/match/:id" element={<MatchPlayer />} />
          </Routes>
          <Footer />
        </Router>
      </SocketProvider>
    </ChakraProvider>
  );
};

export default App;
