import { Box, Link, useColorModeValue } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaTelegram } from 'react-icons/fa';

const scrollAnimation = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
`;

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 10px rgba(82, 178, 255, 0.5), 
                0 0 20px rgba(82, 178, 255, 0.3), 
                0 0 30px rgba(82, 178, 255, 0.1);
  }
  50% {
    box-shadow: 0 0 15px rgba(82, 178, 255, 0.6), 
                0 0 25px rgba(82, 178, 255, 0.4), 
                0 0 35px rgba(82, 178, 255, 0.2);
  }
  100% {
    box-shadow: 0 0 10px rgba(82, 178, 255, 0.5), 
                0 0 20px rgba(82, 178, 255, 0.3), 
                0 0 30px rgba(82, 178, 255, 0.1);
  }
`;

const AnnouncementBar = () => {
  const bgGradient = useColorModeValue(
    'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%)',
    'linear-gradient(90deg, rgba(26,32,44,0.7) 0%, rgba(45,55,72,0.7) 33%, rgba(74,85,104,0.7) 66%, rgba(26,32,44,0.7) 100%)'
  );
  
  const glassEffect = useColorModeValue(
    'blur(12px) saturate(150%)',
    'blur(8px) saturate(180%)'
  );
  
  const borderColor = useColorModeValue('whiteAlpha.200', 'blue.700');
  const textGlow = useColorModeValue('0 0 10px rgba(0,0,0,0.2)', '0 0 10px rgba(255,255,255,0.4)');
  const boxShadow = useColorModeValue(
    '0 4px 30px rgba(0, 0, 0, 0.05)',
    '0 4px 30px rgba(0, 0, 0, 0.2)'
  );

  const content = "🔔 Having trouble watching matches? Contact us on Telegram @crickflix_help &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; 🎯 For the best streaming experience, join our Telegram channel @crickflix_help &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ⚡ Need help? We're here 24/7 on Telegram @crickflix_help &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;";

  return (
    <Box
      position="relative"
      overflow="hidden"
      backdropFilter={glassEffect}
      borderBottom="1px solid"
      borderColor={borderColor}
      boxShadow={boxShadow}
      bg={useColorModeValue('rgba(255, 255, 255, 0.1)', 'blackAlpha.500')}
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: bgGradient,
          backgroundSize: '200% 200%',
          animation: `${gradientAnimation} 15s ease infinite`,
          zIndex: -1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(8px)',
          zIndex: -1,
        }
      }}
    >
      <Box
        py={2.5}
        position="relative"
        whiteSpace="nowrap"
        animation={`${glowAnimation} 3s ease-in-out infinite`}
        overflow="hidden"
        width="100%"
      >
        <Box
          position="relative"
          display="flex"
          width="fit-content"
          animation={`${scrollAnimation} 30s linear infinite`}
          sx={{
            '@media (max-width: 768px)': {
              animation: `${scrollAnimation} 15s linear infinite`,
            },
          }}
        >
          {[...Array(2)].map((_, index) => (
            <Link
              key={index}
              href="https://t.me/crickflix_help"
              isExternal
              display="inline-flex"
              alignItems="center"
              gap={2}
              color={useColorModeValue('gray.700', 'white')}
              fontWeight="medium"
              textShadow={textGlow}
              transition="all 0.3s ease"
              _hover={{
                textDecoration: 'none',
                textShadow: useColorModeValue(
                  '0 0 15px rgba(0,0,0,0.3)',
                  '0 0 15px rgba(255,255,255,0.9)'
                ),
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default AnnouncementBar; 