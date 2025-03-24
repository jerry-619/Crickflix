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
} from '@chakra-ui/react';
import axios from 'axios';
import CategoryCard from '../components/CategoryCard';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
        setCategories(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
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
        <Heading color={headingColor} mb={8}>All Categories</Heading>
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
    </Box>
  );
};

export default Categories; 