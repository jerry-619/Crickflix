import { useState, useEffect, useCallback } from 'react';
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
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import MatchCard from '../components/MatchCard';
import CategoryCard from '../components/CategoryCard';
import { useSocket } from '../context/SocketContext';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [matchesRes, categoriesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/matches`),
        axios.get(`${import.meta.env.VITE_API_URL}/categories`)
      ]);
      
      // Sort matches: live first, then upcoming, then completed
      const sortedMatches = matchesRes.data.sort((a, b) => {
        const statusOrder = { live: 0, upcoming: 1, completed: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      
      setMatches(sortedMatches);
      setCategories(categoriesRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!socket) return;

    // Match updates
    const handleMatchCreated = (newMatch) => {
      console.log('Match event: Created');
      setMatches(prev => [newMatch, ...prev]);
      toast({
        title: 'New Match Added',
        description: `${newMatch.title} has been added`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    };

    const handleMatchUpdated = (updatedMatch) => {
      console.log('Match event: Updated');
      setMatches(prev => prev.map(match => 
        match._id === updatedMatch._id ? updatedMatch : match
      ));
      toast({
        title: 'Match Updated',
        description: `${updatedMatch.title} has been updated`,
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    };

    const handleMatchDeleted = (matchId) => {
      console.log('Match event: Deleted');
      setMatches(prev => prev.filter(match => match._id !== matchId));
      toast({
        title: 'Match Removed',
        description: 'A match has been removed',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    };

    // Category updates
    const handleCategoryCreated = (newCategory) => {
      console.log('Category event: Created');
      setCategories(prev => [newCategory, ...prev]);
      toast({
        title: 'New Category Added',
        description: `${newCategory.name} has been added`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    };

    const handleCategoryUpdated = (updatedCategory) => {
      console.log('Category event: Updated');
      setCategories(prev => prev.map(category => 
        category._id === updatedCategory._id ? updatedCategory : category
      ));
      toast({
        title: 'Category Updated',
        description: `${updatedCategory.name} has been updated`,
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    };

    const handleCategoryDeleted = (categoryId) => {
      console.log('Category event: Deleted');
      setCategories(prev => prev.filter(category => category._id !== categoryId));
      toast({
        title: 'Category Removed',
        description: 'A category has been removed',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    };

    // Subscribe to events
    socket.on('matchCreated', handleMatchCreated);
    socket.on('matchUpdated', handleMatchUpdated);
    socket.on('matchDeleted', handleMatchDeleted);
    socket.on('categoryCreated', handleCategoryCreated);
    socket.on('categoryUpdated', handleCategoryUpdated);
    socket.on('categoryDeleted', handleCategoryDeleted);

    // Cleanup
    return () => {
      socket.off('matchCreated', handleMatchCreated);
      socket.off('matchUpdated', handleMatchUpdated);
      socket.off('matchDeleted', handleMatchDeleted);
      socket.off('categoryCreated', handleCategoryCreated);
      socket.off('categoryUpdated', handleCategoryUpdated);
      socket.off('categoryDeleted', handleCategoryDeleted);
    };
  }, [socket, toast]);

  if (loading) {
    return (
      <Box
        minH="calc(100vh - 64px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={bgColor}
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        minH="calc(100vh - 64px)"
        p={4}
        bg={bgColor}
      >
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box minH="calc(100vh - 64px)" bg={bgColor} py={8}>
      <Container maxW="container.xl">
        <Heading mb={8} color={headingColor}>Categories</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={12}>
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </SimpleGrid>

        <Heading mb={8} color={headingColor}>Latest Matches</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {matches.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Home; 