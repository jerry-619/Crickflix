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
  Divider,
  Avatar,
  Flex,
  Image,
  Skeleton
} from '@chakra-ui/react';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';
import PredictionTabs from '../components/PredictionTabs';
import ShareButtons from '../components/ShareButtons';
import { FiMonitor, FiPlay, FiLink, FiCalendar, FiUser, FiEye } from 'react-icons/fi';
import moment from 'moment-timezone';
import SEO from '../components/SEO';

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
  const textColor = useColorModeValue('blackAlpha.900', 'white');
  const metaColor = useColorModeValue('blackAlpha.700', 'gray.400');
  const contentBgColor = useColorModeValue('gray.50', 'whiteAlpha.100');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

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

  // Generate structured data for the match
  const getStructuredData = () => {
    if (!match) return null;

    return {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": match.title,
      "description": match.description || `Watch ${match.title} live streaming on CrickFlix`,
      "startDate": match.scheduledTime,
      "endDate": match.endTime,
      "location": {
        "@type": "Place",
        "name": match.venue || "Online Streaming"
      },
      "organizer": {
        "@type": "Organization",
        "name": "CrickFlix",
        "url": import.meta.env.VITE_FRONTEND_URL
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": `${import.meta.env.VITE_FRONTEND_URL}/match/${match._id}`
      }
    };
  };

  if (loading) {
    return (
      <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor} display="flex" justifyContent="center" alignItems="center">
        <Skeleton height="500px" w="100%" />
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

  const scheduledTimeLocal = match?.scheduledTime ? moment(match.scheduledTime).local().format('YYYY-MM-DD HH:mm:ss') : 'N/A';
  const scheduledTimeIST = match?.scheduledTime ? moment(match.scheduledTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss') : 'N/A';

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
      <>
        <SEO
          title={match.title}
          description={match.description || `Watch ${match.title} live streaming on CrickFlix`}
          keywords={`${match.title}, live cricket streaming, cricket match, ${match.category?.name || ''}, cricket live`}
          ogTitle={`${match.title} - Live Streaming on CrickFlix`}
          ogDescription={match.description || `Watch ${match.title} live streaming on CrickFlix`}
          canonicalUrl={`${import.meta.env.VITE_FRONTEND_URL}/match/${match._id}`}
          structuredData={getStructuredData()}
        />
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
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4} justify="space-between" wrap="wrap">
                    <HStack spacing={4}>
                      {getStatusBadge(match.status)}
                      <Text color="gray.500">{formatViews(match.views)}</Text>
                    </HStack>
                    <ShareButtons 
                      title={match.title}
                      url={`${import.meta.env.VITE_FRONTEND_URL}/match/${match._id}`}
                    />
                  </HStack>
                  
                  <Heading 
                    size={{ base: "md", md: "lg" }} 
                    textAlign={{ base: "center", md: "left" }}
                  >
                    {match.title}
                  </Heading>
                  
                  {/* Teams Section */}
                  <Box>
                    <Flex 
                      direction={{ base: "column", md: "row" }}
                      align="center"
                      justify="center"
                      gap={{ base: 4, md: 8 }}
                    >
                      <Flex 
                        direction="column"
                        align="center"
                        flex="1"
                      >
                        <Text 
                          fontSize={{ base: "xl", md: "2xl" }} 
                          fontWeight="bold"
                          textAlign="center"
                        >
                          {match.team1?.name}
                        </Text>
                        <Avatar 
                          size={{ base: "lg", md: "xl" }}
                          src={match.team1?.logo} 
                          name={match.team1?.name}
                        />
                      </Flex>
                      
                      <Text 
                        fontSize={{ base: "xl", md: "2xl" }} 
                        fontWeight="bold"
                        alignSelf="center"
                      >
                        VS
                      </Text>
                      
                      <Flex 
                        direction="column"
                        align="center"
                        flex="1"
                      >
                        <Text 
                          fontSize={{ base: "xl", md: "2xl" }} 
                          fontWeight="bold"
                          textAlign="center"
                        >
                          {match.team2?.name}
                        </Text>
                        <Avatar 
                          size={{ base: "lg", md: "xl" }}
                          src={match.team2?.logo} 
                          name={match.team2?.name}
                        />
                      </Flex>
                    </Flex>
                  </Box>

                  {match.description && (
                    <Text 
                      color="gray.600" 
                      textAlign={{ base: "center", md: "left" }}
                    >
                      {match.description}
                    </Text>
                  )}
                  
                  {/* Schedule Info */}
                  <VStack 
                    align={{ base: "center", sm: "flex-start" }}
                    spacing={2}
                  >
                    <Text 
                      color="gray.500"
                      textAlign={{ base: "center", sm: "left" }}
                    >
                      Your Local Time: {scheduledTimeLocal}
                    </Text>
                    {timeLeft && (
                      <Badge colorScheme="blue" variant="subtle">
                        {timeLeft}
                      </Badge>
                    )}
                  </VStack>
                </VStack>
              </Box>

              {/* Predictions Section */}
              {match.category?.name?.toLowerCase().includes('ipl') && (
                <Box>
                  <PredictionTabs matchId={id} />
                </Box>
              )}
            </VStack>
          </Container>
        </Box>
      </>
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
    <>
      <SEO
        title={match.title}
        description={match.description || `Watch ${match.title} live streaming on CrickFlix`}
        keywords={`${match.title}, live cricket streaming, cricket match, ${match.category?.name || ''}, cricket live`}
        ogTitle={`${match.title} - Live Streaming on CrickFlix`}
        ogDescription={match.description || `Watch ${match.title} live streaming on CrickFlix`}
        canonicalUrl={`${import.meta.env.VITE_FRONTEND_URL}/match/${match._id}`}
        structuredData={getStructuredData()}
      />
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
              <VideoPlayer 
                url={selectedSource.url} 
                type={selectedSource.type}
                drmConfig={selectedSource.type === 'dashmpd' ? selectedSource.drmConfig : null}
              />
            </Box>
          ))}
        </Box>

        {/* Match Info & Predictions Section */}
        <Container maxW="8xl" py={8}>
          <VStack spacing={6} align="stretch">
            {/* Status and Share Buttons */}
            <HStack spacing={4} justify="space-between" wrap="wrap">
              <HStack spacing={4}>
                {getStatusBadge(match.status)}
                <Text color="gray.500">{formatViews(match.views)}</Text>
              </HStack>
              <ShareButtons 
                title={match.title}
                url={`${import.meta.env.VITE_FRONTEND_URL}/match/${match._id}`}
              />
            </HStack>

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

            {/* Match Title and Info */}
            <Box>
              <VStack spacing={4} align="stretch">
                <Heading 
                  size={{ base: "md", md: "lg" }} 
                  textAlign={{ base: "center", md: "left" }}
                >
                  {match.title}
                </Heading>
                
                {/* Teams Section */}
                <Box>
                  <Flex 
                    direction={{ base: "column", md: "row" }}
                    align="center"
                    justify="center"
                    gap={{ base: 4, md: 8 }}
                  >
                    <Flex 
                      align="center" 
                      flex={1} 
                      justify="center"
                      gap={4}
                    >
                      <Avatar 
                        size={{ base: "lg", md: "xl" }}
                        src={match.team1?.logo} 
                        name={match.team1?.name}
                      />
                      <Text 
                        fontSize={{ base: "xl", md: "2xl" }} 
                        fontWeight="bold"
                        textAlign="center"
                      >
                        {match.team1?.name}
                      </Text>
                    </Flex>

                    <Text 
                      fontSize={{ base: "2xl", md: "3xl" }} 
                      fontWeight="bold" 
                      color="gray.500"
                      py={{ base: 2, md: 0 }}
                    >
                      VS
                    </Text>

                    <Flex 
                      align="center" 
                      flex={1} 
                      justify="center"
                      gap={4}
                    >
                      <Text 
                        fontSize={{ base: "xl", md: "2xl" }} 
                        fontWeight="bold"
                        textAlign="center"
                      >
                        {match.team2?.name}
                      </Text>
                      <Avatar 
                        size={{ base: "lg", md: "xl" }}
                        src={match.team2?.logo} 
                        name={match.team2?.name}
                      />
                    </Flex>
                  </Flex>
                </Box>

                {match.description && (
                  <Text 
                    color="gray.600" 
                    textAlign={{ base: "center", md: "left" }}
                  >
                    {match.description}
                  </Text>
                )}
                
                {/* Schedule Info */}
                <Flex 
                  direction={{ base: "column", sm: "row" }}
                  align={{ base: "center", sm: "flex-start" }}
                  gap={2}
                >
                  <Text 
                    color="gray.500"
                    textAlign={{ base: "center", sm: "left" }}
                  >
                    Scheduled: {scheduledTimeIST} IST
                  </Text>
                  {timeLeft && (
                    <Badge colorScheme="blue" variant="subtle">
                      {timeLeft}
                    </Badge>
                  )}
                </Flex>
              </VStack>
            </Box>

            <Divider my={4} />

            {/* Predictions Section */}
            {match.category?.name?.toLowerCase().includes('ipl') && (
              <Box>
                <PredictionTabs matchId={id} />
              </Box>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default MatchPlayer; 