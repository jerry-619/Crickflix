import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Image,
  Text,
  Heading,
  VStack,
  Link,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
  HStack,
  Icon
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiCalendar, FiEye } from 'react-icons/fi';

const BlogCard = ({ blog }) => {
  const textColor = useColorModeValue('gray.800', 'white');
  const metaColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Link
      as={RouterLink}
      to={`/blogs/${blog.slug}`}
      _hover={{ textDecoration: 'none' }}
    >
      <Box
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="hidden"
        bg={cardBg}
        transition="all 0.2s"
        _hover={{
          transform: 'translateY(-4px)',
          shadow: 'lg',
          bg: cardHoverBg,
        }}
      >
        <Image
          src={blog.thumbnail || 'https://via.placeholder.com/400x200?text=Blog+Post'}
          alt={blog.title}
          w="full"
          h="200px"
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/400x200?text=Blog+Post"
        />
        <VStack p={4} align="start" spacing={2}>
          <Heading size="md" noOfLines={2} color={textColor}>
            {blog.title}
          </Heading>
          <HStack spacing={4} color={metaColor} fontSize="sm">
            <HStack spacing={1}>
              <Icon as={FiUser} />
              <Text>{blog.author}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiCalendar} />
              <Text>{new Date(blog.createdAt).toLocaleDateString()}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiEye} />
              <Text>{blog.views || 0} views</Text>
            </HStack>
          </HStack>
          <Box
            noOfLines={3}
            color={textColor}
            className="blog-preview"
            dangerouslySetInnerHTML={{
              __html: blog.content.replace(/<[^>]*>/g, '')
            }}
          />
        </VStack>
      </Box>
    </Link>
  );
};

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/blogs`);
        setBlogs(data.filter(blog => blog.isActive));
        setError(null);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor}>
        <Box maxW="8xl" mx="auto" py={8} px={{ base: 4, md: 6, lg: 8 }}>
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={6}
          >
            {[...Array(6)].map((_, i) => (
              <Box key={i}>
                <Skeleton height="200px" mb={4} />
                <Skeleton height="20px" mb={2} />
                <Skeleton height="20px" mb={2} />
                <Skeleton height="20px" />
              </Box>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor}>
        <Box maxW="8xl" mx="auto" py={8} px={{ base: 4, md: 6, lg: 8 }}>
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box w="100%" minH="calc(100vh - 64px)" bg={bgColor}>
      <Box maxW="8xl" mx="auto" py={8} px={{ base: 4, md: 6, lg: 8 }}>
        <Heading mb={8} color={headingColor}>Latest Blogs</Heading>
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
          gap={6}
        >
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Blogs; 