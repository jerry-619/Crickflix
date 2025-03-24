import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Image,
  Text,
  Heading,
  VStack,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
  HStack,
  Icon,
  Divider
} from '@chakra-ui/react';
import { FiCalendar, FiUser, FiEye } from 'react-icons/fi';
import axios from 'axios';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('white', 'blackAlpha.500');
  const textColor = useColorModeValue('blackAlpha.900', 'white');
  const metaColor = useColorModeValue('blackAlpha.700', 'gray.400');
  const contentBgColor = useColorModeValue('gray.50', 'whiteAlpha.100');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/blogs/${slug}`);
        setBlog(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <Box w="100%" minH="calc(100vh - 64px)">
        <VStack spacing={4} align="stretch" w="100%">
          <Skeleton height="500px" w="100%" />
          <Box px={4} w="100%">
            <Skeleton height="40px" mb={4} />
            <Skeleton height="20px" width="200px" mb={8} />
            <Skeleton height="20px" mb={2} />
            <Skeleton height="20px" mb={2} />
            <Skeleton height="20px" mb={2} />
            <Skeleton height="20px" mb={2} />
          </Box>
        </VStack>
      </Box>
    );
  }

  if (error || !blog) {
    return (
      <Box w="100%" px={4}>
        <Alert status="error">
          <AlertIcon />
          {error || 'Blog not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box w="100%" minH="calc(100vh - 64px)">
      {/* Hero Section with Image */}
      <Box position="relative" w="100%" h={{ base: "300px", md: "500px", lg: "600px" }}>
        <Image
          src={blog.thumbnail || 'https://via.placeholder.com/1920x1080?text=Blog+Post'}
          alt={blog.title}
          w="100%"
          h="100%"
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/1920x1080?text=Blog+Post"
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)"
        />
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          p={{ base: 6, md: 8, lg: 12 }}
        >
          <Box maxW="8xl" mx="auto">
            <Heading
              color="white"
              fontSize={{ base: "3xl", md: "4xl", lg: "6xl" }}
              mb={4}
              textShadow="2px 2px 4px rgba(0,0,0,0.4)"
            >
              {blog.title}
            </Heading>
            <HStack spacing={6} color="white" flexWrap="wrap">
              <HStack spacing={2}>
                <Icon as={FiUser} color={metaColor} />
                <Text color={metaColor} fontSize={{ base: "sm", md: "md" }}>{blog.author}</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FiCalendar} color={metaColor} />
                <Text color={metaColor} fontSize={{ base: "sm", md: "md" }}>
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FiEye} color={metaColor} />
                <Text color={metaColor} fontSize={{ base: "sm", md: "md" }}>
                  {blog.views || 0} views
                </Text>
              </HStack>
            </HStack>
          </Box>
        </Box>
      </Box>

      {/* Content Section */}
      <Box
        w="100%"
        bg={bgColor}
        backdropFilter="blur(8px)"
        py={{ base: 8, md: 12, lg: 16 }}
      >
        <Box maxW="8xl" mx="auto" px={{ base: 4, md: 6, lg: 8 }}>
          <Box
            bg={contentBgColor}
            p={{ base: 6, md: 8, lg: 10 }}
            borderRadius="lg"
            boxShadow="lg"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Box
              fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
              lineHeight="tall"
              color={textColor}
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
              sx={{
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 'lg',
                  my: 4
                },
                '& p': {
                  mb: 4
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  mt: 6,
                  mb: 4,
                  fontWeight: 'bold'
                },
                '& ul, & ol': {
                  pl: 6,
                  mb: 4
                },
                '& li': {
                  mb: 2
                },
                '& blockquote': {
                  borderLeftWidth: '4px',
                  borderLeftColor: 'gray.200',
                  pl: 4,
                  py: 2,
                  my: 4,
                  fontStyle: 'italic'
                },
                '& pre': {
                  bg: 'gray.100',
                  p: 4,
                  borderRadius: 'md',
                  overflowX: 'auto',
                  mb: 4
                },
                '& code': {
                  fontFamily: 'monospace',
                  bg: 'gray.100',
                  p: 1,
                  borderRadius: 'sm'
                },
                '& table': {
                  width: '100%',
                  mb: 4,
                  borderCollapse: 'collapse'
                },
                '& th, & td': {
                  border: '1px solid',
                  borderColor: 'gray.200',
                  p: 2
                },
                '& a': {
                  color: 'blue.500',
                  textDecoration: 'underline',
                  _hover: {
                    color: 'blue.600'
                  }
                }
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BlogDetail; 