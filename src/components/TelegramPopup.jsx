import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Image,
  useDisclosure,
  Box,
  Icon,
} from '@chakra-ui/react';
import { FaTelegram } from 'react-icons/fa';

const TelegramPopup = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hasSeenPopup, setHasSeenPopup] = useState(false);
  const [hasClickedJoin, setHasClickedJoin] = useState(false);

  useEffect(() => {
    // Check if user has seen the popup before and when
    const popupData = localStorage.getItem('telegramPopupData');
    const currentTime = new Date().getTime();

    if (!popupData) {
      onOpen();
    } else {
      const { lastSeen } = JSON.parse(popupData);
      const hoursSinceLastSeen = (currentTime - lastSeen) / (1000 * 60 * 60);
      
      // Show popup again if it's been more than 24 hours
      if (hoursSinceLastSeen >= 24) {
        onOpen();
      } else {
        setHasSeenPopup(true);
      }
    }
  }, [onOpen]);

  const handleJoinClick = () => {
    window.open('https://t.me/btwmetflix', '_blank');
    setHasClickedJoin(true);
  };

  const handleAlreadyJoined = () => {
    markPopupAsSeen();
  };

  const markPopupAsSeen = () => {
    const popupData = {
      lastSeen: new Date().getTime(),
      joined: true
    };
    localStorage.setItem('telegramPopupData', JSON.stringify(popupData));
    setHasSeenPopup(true);
    onClose();
  };

  if (hasSeenPopup) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      isCentered 
      motionPreset="slideInBottom"
      closeOnOverlayClick={false}
      closeOnEsc={false}
      size="md"
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent bg="gray.800" color="white" mx={4}>
        <ModalHeader 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          fontSize="2xl"
          fontWeight="bold"
        >
          <Icon as={FaTelegram} color="telegram.500" boxSize={8} mr={2} />
          Join Our Telegram
        </ModalHeader>
        {hasClickedJoin && <ModalCloseButton />}
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            <Box 
              position="relative" 
              height="150px" 
              overflow="hidden" 
              borderRadius="lg"
            >
              <Image
                src="/tg-banner.jpg"
                alt="Telegram Community"
                fallbackSrc="https://via.placeholder.com/800x400?text=Join+Our+Telegram+Community"
                objectFit="cover"
                width="100%"
                height="100%"
              />
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="blackAlpha.600"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  textAlign="center"
                  textShadow="2px 2px 4px rgba(0,0,0,0.8)"
                >
                  Get Latest Updates & Streams
                </Text>
              </Box>
            </Box>
            
            <Text textAlign="center" fontSize="lg" fontWeight="medium">
              Join our Telegram community to get instant notifications about:
            </Text>
            
            <VStack align="start" pl={4} spacing={3}>
              <Text fontSize="md">• Live match updates</Text>
              <Text fontSize="md">• New streaming links</Text>
              <Text fontSize="md">• Match schedules</Text>
              <Text fontSize="md">• Exclusive content</Text>
            </VStack>

            <Button
              colorScheme="blue"
              size="lg"
              height="60px"
              fontSize="xl"
              leftIcon={<Icon as={FaTelegram} boxSize={6} />}
              onClick={handleJoinClick}
              _hover={{ 
                transform: 'scale(1.02)',
                bg: 'blue.500'
              }}
              _active={{
                transform: 'scale(0.98)',
                bg: 'blue.600'
              }}
              bg="blue.400"
              transition="all 0.2s"
              color="white"
              boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
              mb={2}
            >
              Join Telegram Channel
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={handleAlreadyJoined}
              _hover={{ bg: 'whiteAlpha.200' }}
              isDisabled={!hasClickedJoin}
              opacity={hasClickedJoin ? 1 : 0.5}
            >
              I've Already Joined
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TelegramPopup; 