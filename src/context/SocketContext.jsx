import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useToast } from '@chakra-ui/react';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const toast = useToast();

  useEffect(() => {
    // Remove /api from the URL for Socket.IO connection
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    
    const newSocket = io(baseUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      toast({
        title: 'Connected to server',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right',
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to server. Retrying...',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, reconnect manually
        newSocket.connect();
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [toast]);

  if (!socket) {
    return null;
  }

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}; 