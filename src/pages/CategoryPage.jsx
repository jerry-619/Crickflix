import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  Text,
  Image,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  useToast,
  Button,
} from '@chakra-ui/react';
import axios from 'axios';
import MatchCard from '../components/MatchCard';
import { useSocket } from '../context/SocketContext';
import SEO from '../components/SEO';

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const overlayBg = useColorModeValue('blackAlpha.500', 'blackAlpha.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const descriptionColor = useColorModeValue('gray.600', 'gray.200');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First fetch category
        const categoryRes = await axios.get(`${import.meta.env.VITE_API_URL}/categories/${slug}`);
        setCategory(categoryRes.data);

        // Then fetch matches for this category
        const matchesRes = await axios.get(`${import.meta.env.VITE_API_URL}/matches?category=${slug}`);
        setMatches(matchesRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError(err.response?.data?.message || 'Failed to load content');
        setLoading(false);
      }
    };

    fetchData();

    // Socket event listeners
    socket.on('matchCreated', (newMatch) => {
      if (newMatch.category.slug === slug) {
        setMatches(prev => [newMatch, ...prev]);
        toast({
          title: 'New Match Added',
          description: `${newMatch.title} has been added to this category`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    });

    socket.on('matchUpdated', (updatedMatch) => {
      if (updatedMatch.category.slug === slug) {
        setMatches(prev => prev.map(match => 
          match._id === updatedMatch._id ? updatedMatch : match
        ));
      } else {
        // Remove match if it was moved to a different category
        setMatches(prev => prev.filter(match => match._id !== updatedMatch._id));
      }
    });

    socket.on('matchDeleted', (matchId) => {
      setMatches(prev => prev.filter(match => match._id !== matchId));
    });

    socket.on('categoryUpdated', (updatedCategory) => {
      if (updatedCategory.slug === slug) {
        setCategory(updatedCategory);
      }
    });

    return () => {
      socket.off('matchCreated');
      socket.off('matchUpdated');
      socket.off('matchDeleted');
      socket.off('categoryUpdated');
    };
  }, [slug, socket, toast]);

  // Generate structured data for the category page
  const getStructuredData = () => {
    if (!category) return null;

    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": category.name,
      "description": category.description,
      "image": category.thumbnail,
      "url": `${import.meta.env.VITE_FRONTEND_URL}/category/${category.slug}`,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": matches.map((match, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "SportsEvent",
            "name": match.title,
            "url": `${import.meta.env.VITE_FRONTEND_URL}/match/${match._id}`,
            "startDate": match.scheduledTime,
            "endDate": match.endTime
          }
        }))
      }
    };
  };

  if (loading) {
    return (
      <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor} display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  if (error || !category) {
    return (
      <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor}>
        <Container maxW="8xl" py={8}>
          <Alert status="error" variant="solid" borderRadius="md" mb={4}>
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription display="block">
                {error || 'Category not found'}
              </AlertDescription>
            </Box>
          </Alert>
          <Button onClick={() => navigate('/')} colorScheme="blue">
            Go Back Home
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <>
      <SEO
        title={category.name}
        description={category.description}
        keywords={`${category.name}, cricket matches, live cricket, cricket streaming, ${category.name} matches`}
        ogTitle={`${category.name} - Cricket Matches on CrickFlix`}
        ogDescription={category.description}
        ogImage={category.thumbnail}
        canonicalUrl={`${import.meta.env.VITE_FRONTEND_URL}/category/${category.slug}`}
        structuredData={getStructuredData()}
      />
      <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor}>
        {/* Category Banner */}
        <Box 
          w="100%" 
          h={{ base: "200px", md: "300px", lg: "400px" }}
          position="relative" 
          overflow="hidden"
        >
          <Image
            src={category.thumbnail}
            alt={category.name}
            objectFit="cover"
            w="100%"
            h="100%"
            fallbackSrc="https://via.placeholder.com/1920x400?text=Category"
          />
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg={overlayBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            textAlign="center"
            p={4}
          >
            <Container maxW="8xl" centerContent>
              <Heading color={textColor} size="2xl" mb={4}>
                {category.name}
              </Heading>
              {category.description && (
                <Text color={descriptionColor} fontSize={{ base: "lg", md: "xl" }} maxW="3xl">
                  {category.description}
                </Text>
              )}
            </Container>
          </Box>
        </Box>

        {/* Matches Grid */}
        <Container maxW="8xl" py={8}>
          {matches.length === 0 ? (
            <Alert status="info" variant="solid" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>No Matches</AlertTitle>
                <AlertDescription display="block">
                  No matches available in this category at the moment.
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <SimpleGrid 
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }} 
              spacing={{ base: 4, md: 6 }}
            >
              {matches.map(match => (
                <MatchCard key={match._id} match={match} />
              ))}
            </SimpleGrid>
          )}
        </Container>
      </Box>
    </>
  );
};

export default CategoryPage; 