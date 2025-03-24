import {
  Box,
  Image,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
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

export default BlogCard; 