import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Link,
  Divider,
  Card,
  CardBody,
  HStack,
} from '@chakra-ui/react';
import { FaTelegram, FaEnvelope, FaGithub, FaQuestionCircle, FaExclamationCircle, FaPlayCircle } from 'react-icons/fa';
import SEO from '../components/SEO';
import { useRef } from 'react';

const HelpCenter = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const accordionBg = useColorModeValue('whiteAlpha.800', 'blackAlpha.400');
  const accordionHoverBg = useColorModeValue('whiteAlpha.900', 'blackAlpha.500');
  const buttonColor = useColorModeValue('gray.800', 'whiteAlpha.900');

  // Refs for scrolling
  const howToWatchRef = useRef(null);
  const commonIssuesRef = useRef(null);
  const faqRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const faqs = [
    {
      question: "What is Crickflix?",
      answer: "Crickflix is your ultimate destination for live cricket streaming. We provide high-quality streams for cricket matches from various tournaments and series worldwide."
    },
    {
      question: "Is Crickflix free to use?",
      answer: "Yes, Crickflix is completely free to use. You can watch all matches without any subscription or payment."
    },
    {
      question: "Why do I see multiple stream options?",
      answer: "We provide multiple stream options to ensure you have backup streams in case one isn't working well. You can switch between streams to find the one that works best for you."
    },
    {
      question: "Why isn't the stream working?",
      answer: "If a stream isn't working, try these steps:\n1. Switch to a different stream option\n2. Refresh your browser\n3. Check your internet connection\n4. Try using a different browser"
    },
    {
      question: "How can I improve stream quality?",
      answer: "To improve stream quality:\n1. Use a stable internet connection\n2. Select appropriate quality from the player settings\n3. Close other browser tabs\n4. Try different stream sources"
    },
    {
      question: "Can I watch on mobile devices?",
      answer: "Yes, Crickflix is fully responsive and works on all mobile devices. You can watch matches on your smartphone or tablet through any modern web browser."
    }
  ];

  const quickLinks = [
    {
      title: "How to Watch",
      icon: FaPlayCircle,
      description: "Learn how to get the best streaming experience on Crickflix",
      ref: howToWatchRef
    },
    {
      title: "Common Issues",
      icon: FaExclamationCircle,
      description: "Find solutions to common streaming problems",
      ref: commonIssuesRef
    },
    {
      title: "FAQ",
      icon: FaQuestionCircle,
      description: "Browse frequently asked questions",
      ref: faqRef
    }
  ];

  return (
    <>
      <SEO 
        title="Help Center - Crickflix"
        description="Get help and support for Crickflix. Find answers to frequently asked questions, contact information, and troubleshooting guides."
      />
      
      <Box bg={bgColor} minH="calc(100vh - 64px)" py={8}>
        <Container maxW="6xl">
          <VStack spacing={8} align="stretch">
            {/* Header Section */}
            <Box textAlign="center" py={8}>
              <Heading 
                as="h1" 
                size="2xl" 
                color={headingColor}
                mb={4}
              >
                How can we help?
              </Heading>
              <Text color={textColor} fontSize="lg">
                Find answers, contact support, and get help with Crickflix
              </Text>
            </Box>

            {/* Quick Links Section */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {quickLinks.map((link, index) => (
                <Card
                  key={index}
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  cursor="pointer"
                  onClick={() => scrollToSection(link.ref)}
                  _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.3s"
                >
                  <CardBody>
                    <VStack spacing={4} align="flex-start">
                      <Icon as={link.icon} boxSize={6} color="teal.500" />
                      <Heading size="md" color={headingColor}>
                        {link.title}
                      </Heading>
                      <Text color={textColor}>
                        {link.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>

            {/* How to Watch Section */}
            <Box ref={howToWatchRef} py={8}>
              <Heading as="h2" size="xl" mb={6} color={headingColor}>
                How to Watch
              </Heading>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Text color={textColor}>
                      Follow these simple steps to start watching cricket matches on Crickflix:
                    </Text>
                    <VStack align="stretch" pl={4}>
                      <Text color={textColor}>1. Browse available matches from the home page or Live section</Text>
                      <Text color={textColor}>2. Click on any match to open the match player</Text>
                      <Text color={textColor}>3. Choose your preferred stream quality from the player settings</Text>
                      <Text color={textColor}>4. If a stream isn't working, try switching to different stream options</Text>
                      <Text color={textColor}>5. Use fullscreen mode for the best viewing experience</Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </Box>

            {/* Common Issues Section */}
            <Box ref={commonIssuesRef} py={8}>
              <Heading as="h2" size="xl" mb={6} color={headingColor}>
                Common Issues
              </Heading>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <VStack align="stretch" spacing={6}>
                      <Box>
                        <Heading size="md" mb={2} color={headingColor}>Stream Not Loading</Heading>
                        <Text color={textColor}>
                          If the stream isn't loading, try refreshing the page, switching to a different stream source, or checking your internet connection.
                        </Text>
                      </Box>
                      <Box>
                        <Heading size="md" mb={2} color={headingColor}>Buffering Issues</Heading>
                        <Text color={textColor}>
                          For buffering problems, try lowering the stream quality, closing other browser tabs, or connecting to a faster internet network.
                        </Text>
                      </Box>
                      <Box>
                        <Heading size="md" mb={2} color={headingColor}>Audio Problems</Heading>
                        <Text color={textColor}>
                          If you're experiencing audio issues, check if the stream is muted, adjust your device volume, or try a different stream source.
                        </Text>
                      </Box>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </Box>

            {/* FAQ Section */}
            <Box ref={faqRef} py={8}>
              <Heading as="h2" size="xl" mb={6} color={headingColor}>
                Frequently Asked Questions
              </Heading>
              <Accordion allowMultiple>
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    mb={4}
                    bg={accordionBg}
                    backdropFilter="blur(8px)"
                    transition="all 0.2s"
                  >
                    <h3>
                      <AccordionButton 
                        py={4}
                        _hover={{ bg: accordionHoverBg }}
                        transition="all 0.2s"
                      >
                        <Box flex="1" textAlign="left" fontWeight="600">
                          {faq.question}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h3>
                    <AccordionPanel 
                      pb={4} 
                      color={textColor}
                      bg={useColorModeValue('whiteAlpha.600', 'blackAlpha.300')}
                    >
                      {faq.answer.split('\\n').map((line, i) => (
                        <Text key={i} mb={i !== faq.answer.split('\\n').length - 1 ? 2 : 0}>
                          {line}
                        </Text>
                      ))}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </Box>

            <Divider />

            {/* Contact Section */}
            <Box py={8}>
              <Heading as="h2" size="xl" mb={6} color={headingColor} textAlign="center">
                Contact Us
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Link 
                  href="https://t.me/crickflix_help" 
                  isExternal
                  _hover={{ textDecoration: 'none' }}
                >
                  <Card
                    bg={cardBg}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    _hover={{
                      transform: 'translateY(-4px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.3s"
                  >
                    <CardBody>
                      <VStack spacing={4}>
                        <Icon as={FaTelegram} boxSize={8} color="#0088cc" />
                        <Text fontWeight="bold" color={headingColor}>Telegram</Text>
                        <Text color={textColor}>Chat with us on Telegram</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </Link>

                <Link 
                  href="mailto:itxjerry.com@gmail.com"
                  isExternal
                  _hover={{ textDecoration: 'none' }}
                >
                  <Card
                    bg={cardBg}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    _hover={{
                      transform: 'translateY(-4px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.3s"
                  >
                    <CardBody>
                      <VStack spacing={4}>
                        <Icon as={FaEnvelope} boxSize={8} color="red.500" />
                        <Text fontWeight="bold" color={headingColor}>Email</Text>
                        <Text color={textColor}>Send us an email</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </Link>

                <Link 
                  href="https://github.com/jerry-619" 
                  isExternal
                  _hover={{ textDecoration: 'none' }}
                >
                  <Card
                    bg={cardBg}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    _hover={{
                      transform: 'translateY(-4px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.3s"
                  >
                    <CardBody>
                      <VStack spacing={4}>
                        <Icon as={FaGithub} boxSize={8} />
                        <Text fontWeight="bold" color={headingColor}>GitHub</Text>
                        <Text color={textColor}>Follow project updates</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </Link>
              </SimpleGrid>
            </Box>

            {/* Additional Help Box */}
            <Box 
              py={8} 
              px={6} 
              borderRadius="lg" 
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              textAlign="center"
            >
              <VStack spacing={4}>
                <Heading size="md" color={headingColor}>
                  Still Need Help?
                </Heading>
                <Text color={textColor}>
                  If you couldn't find what you're looking for, feel free to reach out to us directly.
                </Text>
                <HStack spacing={4} justify="center">
                  <Button
                    as={Link}
                    href="https://t.me/crickflixx"
                    isExternal
                    leftIcon={<FaTelegram />}
                    colorScheme="telegram"
                    color={buttonColor}
                    _hover={{
                      bg: 'telegram.600',
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    _active={{
                      bg: 'telegram.700',
                    }}
                  >
                    Chat on Telegram
                  </Button>
                  <Button
                    as={Link}
                    href="mailto:itxjerry.com@gmail.com"
                    isExternal
                    leftIcon={<FaEnvelope />}
                    colorScheme="red"
                    color="white"
                    _hover={{
                      bg: 'red.600',
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    _active={{
                      bg: 'red.700',
                    }}
                  >
                    Send Email
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default HelpCenter; 