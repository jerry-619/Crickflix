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
import SEO from '../components/SEO';

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

  // Generate structured data for the blog post
  const getStructuredData = () => {
    if (!blog) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title,
      "description": blog.description || blog.excerpt,
      "image": blog.thumbnail || blog.featuredImage,
      "author": {
        "@type": "Person",
        "name": blog.author?.name || "CrickFlix Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "CrickFlix",
        "logo": {
          "@type": "ImageObject",
          "url": `${import.meta.env.VITE_FRONTEND_URL}/logo.png`
        }
      },
      "datePublished": blog.createdAt,
      "dateModified": blog.updatedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${import.meta.env.VITE_FRONTEND_URL}/blogs/${blog.slug}`
      }
    };
  };

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

  if (error) {
    return (
      <Box w="100%" minH="calc(100vh - 64px)" p={4}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <SEO
        title={blog.title}
        description={blog.description || blog.excerpt}
        keywords={`${blog.title}, cricket blog, cricket news, cricket analysis, ${blog.category?.name || ''}`}
        ogTitle={blog.title}
        ogDescription={blog.description || blog.excerpt}
        ogImage={blog.thumbnail || blog.featuredImage}
        canonicalUrl={`${import.meta.env.VITE_FRONTEND_URL}/blogs/${blog.slug}`}
        structuredData={getStructuredData()}
      />
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
                    mb: 4,
                    color: textColor
                  },
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    mt: 6,
                    mb: 4,
                    fontWeight: 'bold',
                    color: textColor
                  },
                  '& ul, & ol': {
                    pl: 6,
                    mb: 4,
                    color: textColor
                  },
                  '& li': {
                    mb: 2,
                    color: textColor
                  },
                  '& blockquote': {
                    borderLeftWidth: '4px',
                    borderLeftColor: borderColor,
                    pl: 4,
                    py: 2,
                    my: 4,
                    fontStyle: 'italic',
                    color: textColor,
                    bg: useColorModeValue('gray.50', 'whiteAlpha.100')
                  },
                  '& pre': {
                    bg: useColorModeValue('gray.100', 'whiteAlpha.100'),
                    p: 4,
                    borderRadius: 'md',
                    overflowX: 'auto',
                    mb: 4,
                    color: textColor
                  },
                  '& code': {
                    fontFamily: 'monospace',
                    bg: useColorModeValue('gray.100', 'whiteAlpha.100'),
                    p: 1,
                    borderRadius: 'sm',
                    color: textColor
                  },
                  '& table': {
                    width: '100%',
                    mb: 4,
                    borderCollapse: 'collapse',
                    color: textColor
                  },
                  '& th, & td': {
                    border: '1px solid',
                    borderColor: borderColor,
                    p: 2,
                    color: textColor
                  },
                  '& a': {
                    color: useColorModeValue('blue.600', 'blue.300'),
                    textDecoration: 'underline',
                    _hover: {
                      color: useColorModeValue('blue.700', 'blue.200')
                    }
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default BlogDetail; 