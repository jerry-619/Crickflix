import { Box, Image, Heading, Text, LinkBox, LinkOverlay } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <LinkBox
      as="article"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      transition="transform 0.2s"
      _hover={{
        transform: 'scale(1.02)',
        shadow: 'lg'
      }}
    >
      <Image
        src={category.thumbnail || 'https://via.placeholder.com/400x200?text=Cricket+Category'}
        alt={category.name}
        width="100%"
        height="200px"
        objectFit="cover"
      />
      
      <Box p={4}>
        <LinkOverlay as={RouterLink} to={`/category/${category.slug}`}>
          <Heading size="md" mb={2}>
            {category.name}
          </Heading>
        </LinkOverlay>
        
        {category.description && (
          <Text noOfLines={2} color="gray.600">
            {category.description}
          </Text>
        )}
      </Box>
    </LinkBox>
  );
};

export default CategoryCard; 