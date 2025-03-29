import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  useColorModeValue,
  HStack,
  ButtonGroup,
  Icon,
  Divider
} from '@chakra-ui/react';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';
import PredictionTabs from '../components/PredictionTabs';
import { FiMonitor, FiPlay, FiLink } from 'react-icons/fi';
import moment from 'moment-timezone';

const MatchPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [selectedSource, setSelectedSource] = useState(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const buttonBg = useColorModeValue('gray.100', 'gray.700');
  const buttonHoverBg = useColorModeValue('gray.200', 'gray.600');
  const buttonActiveBg = useColorModeValue('blue.500', 'blue.400');
  const buttonActiveColor = 'white';

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/matches/${id}`);
        setMatch(data);
        
        // Set initial streaming source - prioritize legacy URLs
        if (data.streamingUrl || data.iframeUrl) {
          setSelectedSource({
            name: 'Default Stream',
            url: data.streamingUrl || data.iframeUrl,
            type: data.iframeUrl ? 'iframe' : 'm3u8'
          });
        } else if (data.streamingSources?.length > 0) {
          setSelectedSource(data.streamingSources[0]);
        }
        
        // Only increment views for live matches
        if (data.status === 'live') {
          try {
            await axios.post(`${import.meta.env.VITE_API_URL}/matches/${id}/view`);
          } catch (viewErr) {
            // Silent error handling for view count
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load match');
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id]);

  useEffect(() => {
    if (match?.status === 'upcoming' && match.scheduledTime) {
      const calculateTimeLeft = () => {
        const now = new Date().getTime();
        const matchTime = new Date(match.scheduledTime).getTime();
        const difference = matchTime - now;
        
        if (difference <= 0) return 'Starting soon';
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days} days ${hours} hours left`;
        if (hours > 0) return `${hours} hours ${minutes} minutes left`;
        return `${minutes} minutes left`;
      };

      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 60000); // Update every minute
      
      setTimeLeft(calculateTimeLeft());
      
      return () => clearInterval(timer);
    }
  }, [match?.status, match?.scheduledTime]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: { color: 'blue', text: 'UPCOMING' },
      live: { color: 'green', text: 'LIVE' },
      completed: { color: 'gray', text: 'COMPLETED' }
    };

    const config = statusConfig[status] || statusConfig.upcoming;
    return (
      <Badge colorScheme={config.color} variant="solid">
        {config.text}
      </Badge>
    );
  };

  const formatViews = (views) => {
    if (!views && views !== 0) return 'No views';
    if (views === 0) return 'New';
    if (views === 1) return '1 view';
    return `${views.toLocaleString()} views`;
  };

  const scheduledTimeIST = match.scheduledTime ? moment(match.scheduledTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss') : 'N/A';

  if (loading) {
    return (
      <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor} display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  if (error || !match) {
    return (
      <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor}>
        <Box maxW="8xl" mx="auto" py={8} px={{ base: 4, md: 6, lg: 8 }}>
          <Alert status="error" variant="solid" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error || 'Match not found'}</AlertDescription>
          </Alert>
          <Button mt={4} onClick={() => navigate('/')} colorScheme="blue">
            Go Back Home
          </Button>
        </Box>
      </Box>
    );
  }

  // Prevent access to completed matches
  if (match.status === 'completed') {
    return (
      <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor}>
        <Box maxW="8xl" mx="auto" py={8} px={{ base: 4, md: 6, lg: 8 }}>
          <Alert status="info" variant="solid" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Match Completed</AlertTitle>
            <AlertDescription>
              This match has ended and is no longer available for viewing.
            </AlertDescription>
          </Alert>
          <Button mt={4} onClick={() => navigate('/')} colorScheme="blue">
            Go Back Home
          </Button>
        </Box>
      </Box>
    );
  }

  // Show countdown and predictions for upcoming matches
  if (match.status === 'upcoming') {
    return (
      <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor}>
        <Container maxW="8xl" py={8}>
          <VStack spacing={6} align="stretch">
            <Alert status="info" variant="solid" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Match Upcoming</AlertTitle>
                <AlertDescription>
                  {timeLeft ? `This match will start in ${timeLeft}.` : 'This match has not started yet.'}
                </AlertDescription>
              </Box>
            </Alert>

            {/* Match Info */}
            <Box>
              <HStack spacing={4} mb={4}>
                {getStatusBadge(match.status)}
                <Text color="gray.500">{formatViews(match.views)}</Text>
              </HStack>
              <Heading size="lg" mb={2}>{match.title}</Heading>
              {match.description && (
                <Text color="gray.600" mb={4}>{match.description}</Text>
              )}
            </Box>

            <Divider />

            {/* Predictions Section */}
            <Box>
              <Heading size="md" mb={4}>Match Predictions</Heading>
              <PredictionTabs matchId={match._id} />
            </Box>

            <Button mt={4} onClick={() => navigate('/')} colorScheme="blue" width="fit-content">
              Go Back Home
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Check if there are any streaming sources available
  const hasStreamingSources = (match.streamingSources && match.streamingSources.length > 0) || 
                            match.streamingUrl || 
                            match.iframeUrl;

  if (!hasStreamingSources) {
    return (
      <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor}>
        <Box maxW="8xl" mx="auto" py={8} px={{ base: 4, md: 6, lg: 8 }}>
          <Alert status="warning" variant="solid" borderRadius="md">
            <AlertIcon />
            <AlertTitle>No Stream Available</AlertTitle>
            <AlertDescription>
              The stream for this match is not available at the moment.
            </AlertDescription>
          </Alert>
          <Button mt={4} onClick={() => navigate('/')} colorScheme="blue">
            Go Back Home
          </Button>
        </Box>
      </Box>
    );
  }

  // Get all available sources
  const allSources = [
    // Add legacy sources first
    ...(match.streamingUrl ? [{
      name: 'Default Stream',
      url: match.streamingUrl,
      type: 'm3u8'
    }] : []),
    ...(match.iframeUrl ? [{
      name: 'Default Iframe',
      url: match.iframeUrl,
      type: 'iframe'
    }] : []),
    // Then add multiple streaming sources
    ...(match.streamingSources || [])
  ];

  const isIframeUrl = (url) => {
    if (!url) return false;
    return url.includes('crichdstreaming') || 
           url.includes('cricfree') || 
           url.includes('iframe') ||
           (selectedSource && selectedSource.type === 'iframe');
  };

  return (
    <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor} overflowX="hidden">
      {/* Player Section */}
      <Box w="100%" bg="black" position="relative">
        {selectedSource && (isIframeUrl(selectedSource.url) ? (
          <Box position="relative" w="100%" paddingTop="56.25%">
            <iframe
              src={selectedSource.url}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
          </Box>
        ) : (
          <Box w="100%">
            <VideoPlayer url={selectedSource.url} />
          </Box>
        ))}
      </Box>

      {/* Match Info & Predictions Section */}
      <Container maxW="8xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Match Info */}
          <Box>
            <HStack spacing={4} mb={4}>
              {getStatusBadge(match.status)}
              <Text color="gray.500">{formatViews(match.views)}</Text>
            </HStack>
            <Heading size="lg" mb={2}>{match.title}</Heading>
            {match.description && (
              <Text color="gray.600" mb={4}>{match.description}</Text>
            )}
          </Box>

          {/* Stream Source Selection */}
          {allSources.length > 1 && (
            <Box>
              <Text fontWeight="bold" mb={2}>Available Streams:</Text>
              <ButtonGroup spacing={2} flexWrap="wrap" gap={2}>
                {allSources.map((source, index) => (
                  <Button
                    key={index}
                    leftIcon={<Icon as={source.type === 'iframe' ? FiMonitor : FiPlay} />}
                    onClick={() => setSelectedSource(source)}
                    bg={selectedSource?.url === source.url ? buttonActiveBg : buttonBg}
                    color={selectedSource?.url === source.url ? buttonActiveColor : undefined}
                    _hover={{ bg: buttonHoverBg }}
                    size="sm"
                  >
                    {source.name || `Stream ${index + 1}`}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
          )}

          <Divider my={4} />

          {/* Predictions Section - Now shown for both upcoming and live matches */}
          {(match.status === 'upcoming' || match.status === 'live') && (
            <Box>
              <Heading size="md" mb={4}>Match Predictions</Heading>
              <PredictionTabs matchId={match._id} />
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default MatchPlayer; 