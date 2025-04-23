import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider, Box, Flex } from '@chakra-ui/react';
import { HelmetProvider } from 'react-helmet-async';
import theme from './theme.js';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes';
import { SocketProvider } from './context/SocketContext';
import TelegramPopup from './components/TelegramPopup';
import SEO from './components/SEO';
import { Analytics } from '@vercel/analytics/react';
import AnnouncementBar from './components/AnnouncementBar';
import GoogleTagManager from './components/GoogleTagManager';

const App = () => {
  
  return (
    <HelmetProvider>
      <ChakraProvider theme={theme}>
        <SocketProvider>
          <Router>
            <GoogleTagManager />
            <Flex direction="column" minH="100vh" bg="gray.900">
              <SEO />
              <Navbar />
              <AnnouncementBar />
              <Box flex="1">
                <AppRoutes />
              </Box>
              <Footer />
               {/* Mobile Bottom Spacer - Only visible on mobile to prevent footer overlap */}
              <Box display={{ base: 'block', md: 'none' }} h="70px" />
              <TelegramPopup />
            </Flex>
            <Analytics />
          </Router>
        </SocketProvider>
      </ChakraProvider>
    </HelmetProvider>
  );
};

export default App;
