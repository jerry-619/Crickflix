import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
} from '@chakra-ui/react';
import axios from 'axios';
import MatchCard from '../components/MatchCard';

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const overlayBg = useColorModeValue('blackAlpha.500', 'blackAlpha.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const descriptionColor = useColorModeValue('gray.600', 'gray.200');

  useEffect(() => {
    const fetchCategoryAndMatches = async () => {
      try {
        setLoading(true);
        const [categoryRes, matchesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/categories/${slug}`),
          axios.get(`${import.meta.env.VITE_API_URL}/matches?category=${slug}`)
        ]);
        setCategory(categoryRes.data);
        setMatches(matchesRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load category and matches');
        setLoading(false);
      }
    };

    fetchCategoryAndMatches();
  }, [slug]);

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
        <Box maxW="8xl" mx="auto" py={8} px={{ base: 4, md: 6, lg: 8 }}>
          <Alert status="error" variant="solid" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error || 'Category not found'}</AlertDescription>
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
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
          <Box maxW="8xl" w="100%" mx="auto" px={{ base: 4, md: 6, lg: 8 }}>
            <Heading color={textColor} size="2xl" mb={4}>
              {category.name}
            </Heading>
            {category.description && (
              <Text color={descriptionColor} fontSize={{ base: "lg", md: "xl" }} maxW="3xl" mx="auto">
                {category.description}
              </Text>
            )}
          </Box>
        </Box>
      </Box>

      {/* Matches Grid */}
      <Box maxW="8xl" mx="auto" py={8} px={{ base: 4, md: 6, lg: 8 }}>
        {matches.length === 0 ? (
          <Alert status="info" variant="solid" borderRadius="md">
            <AlertIcon />
            <AlertTitle>No Matches</AlertTitle>
            <AlertDescription>
              No matches available in this category.
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
    </Box>
  );
};

export default CategoryPage; 