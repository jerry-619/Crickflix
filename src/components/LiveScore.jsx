import { Box, useColorModeValue } from '@chakra-ui/react';

const LiveScore = () => {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box 
      w="100%" 
      h={{ base: "600px", md: "700px" }} 
      bg={bgColor} 
      borderRadius="lg"
      overflow="hidden"
      position="relative"
    >
      <iframe
        src="https://widget.jionews.com/jiotv-cricket/prod/v1/index.html?theme=dark&theme=light&ismobile=true"
        width="100%"
        height="100%"
        style={{
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
        allowFullScreen={true}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        loading="lazy"
        scrolling="yes"
      />
    </Box>
  );
};

export default LiveScore; 