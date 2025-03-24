import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import axios from 'axios';
import MatchCard from '../components/MatchCard';
import CategoryCard from '../components/CategoryCard';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, matchesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/categories`),
          axios.get(`${import.meta.env.VITE_API_URL}/matches`)
        ]);
        setCategories(categoriesRes.data);
        setMatches(matchesRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load content');
        setLoading(false);
      }
    };

    fetchData();
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
          <Alert status="error" variant="solid" borderRadius="md">
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
        <VStack spacing={12} align="stretch" w="100%">
          {/* Categories Section */}
          <Box w="100%">
            <Heading color={headingColor} mb={6} px={2}>Categories</Heading>
            {categories.length === 0 ? (
              <Alert status="info" variant="solid" borderRadius="md">
                <AlertIcon />
                <AlertTitle>No Categories</AlertTitle>
                <AlertDescription>
                  No categories have been created yet.
                </AlertDescription>
              </Alert>
            ) : (
              <SimpleGrid 
                columns={{ base: 1, sm: 2, md: 3, lg: 4 }} 
                spacing={{ base: 4, md: 6 }}
                w="100%"
              >
                {categories.map(category => (
                  <CategoryCard key={category._id} category={category} />
                ))}
              </SimpleGrid>
            )}
          </Box>

          {/* Latest Matches Section */}
          <Box w="100%">
            <Heading color={headingColor} mb={6} px={2}>Latest Matches</Heading>
            {matches.length === 0 ? (
              <Alert status="info" variant="solid" borderRadius="md">
                <AlertIcon />
                <AlertTitle>No Matches</AlertTitle>
                <AlertDescription>
                  No matches have been added yet.
                </AlertDescription>
              </Alert>
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
        </VStack>
      </Box>
    </Box>
  );
};

export default Home; 