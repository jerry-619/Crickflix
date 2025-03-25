import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import BlogCard from '../components/BlogCard';
import { useSocket } from '../context/SocketContext';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/blogs`);
        setBlogs(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load blogs');
        setLoading(false);
      }
    };

    fetchBlogs();

    // Blog updates
    socket.on('blogCreated', (newBlog) => {
      setBlogs(prev => [newBlog, ...prev]);
      toast({
        title: 'New Blog Added',
        description: `${newBlog.title} has been added`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    });

    socket.on('blogUpdated', (updatedBlog) => {
      setBlogs(prev => prev.map(blog => 
        blog._id === updatedBlog._id ? updatedBlog : blog
      ));
      toast({
        title: 'Blog Updated',
        description: `${updatedBlog.title} has been updated`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    });

    socket.on('blogDeleted', (blogId) => {
      setBlogs(prev => prev.filter(blog => blog._id !== blogId));
      toast({
        title: 'Blog Removed',
        description: 'A blog has been removed',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    });

    return () => {
      socket.off('blogCreated');
      socket.off('blogUpdated');
      socket.off('blogDeleted');
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
        <Heading mb={8} color={headingColor}>
          Latest Blogs
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Blogs; 