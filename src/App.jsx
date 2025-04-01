import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { HelmetProvider } from 'react-helmet-async';
import theme from './theme.js';
import Navbar from './components/Navbar';
import AppRoutes from './routes';
import { SocketProvider } from './context/SocketContext';
import TelegramPopup from './components/TelegramPopup';
import SEO from './components/SEO';

const App = () => {
  
  return (
    <HelmetProvider>
      <ChakraProvider theme={theme}>
        <SocketProvider>
          <Router>
            <Box minH="100vh" bg="gray.900">
              <SEO />
              <Navbar />
              <AppRoutes />
              <TelegramPopup />
            </Box>
          </Router>
        </SocketProvider>
      </ChakraProvider>
    </HelmetProvider>
  );
};

export default App;
