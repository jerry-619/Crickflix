import {
  HStack,
  IconButton,
  useToast,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import {
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaTelegram,
  FaLink
} from 'react-icons/fa';

const ShareButtons = ({ title, url }) => {
  const toast = useToast();
  const buttonBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const buttonHoverBg = useColorModeValue('gray.200', 'whiteAlpha.300');

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top"
      });
    } catch (err) {
      toast({
        title: "Failed to copy link",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top"
      });
    }
  };

  const shareButtons = [
    { icon: FaFacebook, label: 'Share on Facebook', url: shareUrls.facebook, color: '#1877F2' },
    { icon: FaTwitter, label: 'Share on Twitter', url: shareUrls.twitter, color: '#1DA1F2' },
    { icon: FaWhatsapp, label: 'Share on WhatsApp', url: shareUrls.whatsapp, color: '#25D366' },
    { icon: FaTelegram, label: 'Share on Telegram', url: shareUrls.telegram, color: '#0088cc' },
  ];

  return (
    <HStack spacing={2}>
      {shareButtons.map((button, index) => (
        <Tooltip key={index} label={button.label} hasArrow>
          <IconButton
            icon={<button.icon />}
            aria-label={button.label}
            onClick={() => window.open(button.url, '_blank')}
            size="md"
            bg={buttonBg}
            color={button.color}
            _hover={{
              bg: buttonHoverBg,
              transform: 'scale(1.1)'
            }}
            transition="all 0.2s"
          />
        </Tooltip>
      ))}
      <Tooltip label="Copy link" hasArrow>
        <IconButton
          icon={<FaLink />}
          aria-label="Copy link"
          onClick={copyToClipboard}
          size="md"
          bg={buttonBg}
          _hover={{
            bg: buttonHoverBg,
            transform: 'scale(1.1)'
          }}
          transition="all 0.2s"
        />
      </Tooltip>
    </HStack>
  );
};

export default ShareButtons; 