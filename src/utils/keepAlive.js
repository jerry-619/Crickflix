import axios from 'axios';

const pingServer = async () => {
  try {
    await axios.get(`${import.meta.env.VITE_API_URL}/ping`);
    console.log('Server pinged successfully');
  } catch (error) {
    console.error('Failed to ping server:', error);
  }
};

export const startKeepAlive = () => {
  // Initial ping
  pingServer();
  
  // Ping every 10 minutes
  const interval = setInterval(pingServer, 10 * 60 * 1000);
  
  // Return cleanup function
  return () => clearInterval(interval);
}; 