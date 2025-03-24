import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import theme from './theme.js';
import Navbar from './components/Navbar';
import AppRoutes from './routes';
import { SocketProvider } from './context/SocketContext';
import TelegramPopup from './components/TelegramPopup';

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <SocketProvider>
        <Router>
          <Box minH="100vh" bg="gray.900">
            <Navbar />
            <AppRoutes />
            <TelegramPopup />
          </Box>
        </Router>
      </SocketProvider>
    </ChakraProvider>
  );
};

export default App;
