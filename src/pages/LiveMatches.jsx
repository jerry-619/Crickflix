import { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Container,
} from '@chakra-ui/react';
import axios from 'axios';
import MatchCard from '../components/MatchCard';

const LiveMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/matches?status=live`);
        const liveMatches = data.filter(match => match.status === 'live' && match.isLive);
        setMatches(liveMatches);
        setError(null);
      } catch (error) {
        console.error('Error fetching live matches:', error);
        setError('Failed to load live matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLiveMatches();
    // Set up polling for live matches
    const interval = setInterval(fetchLiveMatches, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor} display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor}>
        <Box maxW="8xl" mx="auto" py={8} px={{ base: 4, md: 6, lg: 8 }}>
          <Alert 
            status="error" 
            variant="solid" 
            borderRadius="md"
            width="100%"
          >
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor}>
      <Box maxW="8xl" mx="auto" py={8} px={{ base: 4, md: 6, lg: 8 }}>
        <Heading color={headingColor} mb={8}>Live Matches</Heading>
        {matches.length === 0 ? (
          <Box width="100%">
            <Alert 
              status="info" 
              variant="solid" 
              borderRadius="md"
              width="100%"
              display="flex"
              flexDirection="column"
              alignItems="center"
              textAlign="center"
              py={8}
            >
              <AlertIcon boxSize={8} mr={0} mb={4} />
              <AlertTitle fontSize="2xl" mb={2}>No Live Matches</AlertTitle>
              <AlertDescription fontSize="lg">
                There are no matches being streamed live at the moment. Please check back later.
              </AlertDescription>
            </Alert>
          </Box>
        ) : (
          <SimpleGrid 
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }} 
            spacing={{ base: 4, md: 6 }}
            w="100%"
          >
            {matches.map(match => (
              <MatchCard key={match._id} match={match} />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
};

export default LiveMatches; 