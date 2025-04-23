import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import shaka from 'shaka-player';
import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useBreakpointValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  Text,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import 'media-chrome';

const VideoPlayer = ({ url, type = 'm3u8', drmConfig = null }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const shakaPlayerRef = useRef(null);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [audioTracks, setAudioTracks] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(-1);
  const containerRef = useRef(null);
  const mediaControllerRef = useRef(null);
  const [streamError, setStreamError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const [isPlaying, setIsPlaying] = useState(false);
  const playAttemptTimeoutRef = useRef(null);
  // Responsive controls based on screen size
  const showVolumeRange = useBreakpointValue({ base: false, md: true });
  const showTimeDisplay = useBreakpointValue({ base: false, sm: true });
  const showPlaybackRate = useBreakpointValue({ base: false, sm: true });
  const buttonSize = useBreakpointValue({ base: "xs", sm: "sm" });
  const controlsSpacing = useBreakpointValue({ base: "0.5rem", sm: "1rem" });

  // Check if PiP is supported
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  // Add a style tag to force landscape in fullscreen
  const styleTagRef = useRef(null);

  const [isMuted, setIsMuted] = useState(true);

  const [error, setError] = useState(null);

  const handleQualityChange = (levelIndex) => {
    if (type === 'm3u8') {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex;
    setCurrentQuality(levelIndex);
    } else if (type === 'dashmpd') {
      if (!shakaPlayerRef.current) return;
      const tracks = shakaPlayerRef.current.getVariantTracks();
      
      if (levelIndex === -1) {
        // Auto quality
        shakaPlayerRef.current.configure('abr.enabled', true);
      } else {
        // Manual quality selection
        shakaPlayerRef.current.configure('abr.enabled', false);
        shakaPlayerRef.current.selectVariantTrack(tracks[levelIndex]);
      }
      setCurrentQuality(levelIndex);
    }
  };

  const handleAudioChange = (trackIndex) => {
    if (!hlsRef.current) return;
    hlsRef.current.audioTrack = trackIndex;
    setCurrentAudio(trackIndex);
  };

  // Function to handle fullscreen with orientation lock
  const handleFullscreenClick = () => {
    const container = containerRef.current;
    if (!container) return;
    // Request fullscreen
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    }

    // Try to lock orientation after a short delay
    setTimeout(() => {
      try {
        if (window.screen && window.screen.orientation && typeof window.screen.orientation.lock === 'function') {
          window.screen.orientation.lock('landscape').catch(err => {
            console.log('Could not lock orientation in handler:', err);
          });
        }
      } catch (err) {
        console.log('Error in fullscreen handler:', err);
      }
    }, 300);
  };

  // Function to attempt playback
  const attemptPlay = async (video, maxAttempts = 3, currentAttempt = 1) => {
    if (!video || currentAttempt > maxAttempts) {
      setStreamError(true);
      return false;
    }

    try {
      await video.play();
      return true;
    } catch (error) {
      console.log(`Play attempt ${currentAttempt} failed:`, error);
      
      if (error.name !== 'AbortError') {
        if (currentAttempt >= maxAttempts) {
          setStreamError(true);
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        return attemptPlay(video, maxAttempts, currentAttempt + 1);
      }
      return false;
    }
  };

  // Initialize Shaka Player
  const initShaka = async () => {
    try {
      shaka.polyfill.installAll();
      
      if (!shaka.Player.isBrowserSupported()) {
        throw new Error('Browser not supported for DASH playback');
      }

      const video = videoRef.current;
      // Create player first
      const player = new shaka.Player();
      shakaPlayerRef.current = player;

      // Then attach to the video element
      await player.attach(video);

      // Add error handler with detailed logging
      player.addEventListener('error', (event) => {
        const error = event.detail;
        console.error('Shaka error details:', {
          code: error.code,
          category: error.category,
          severity: error.severity,
          message: error.message,
          data: error.data
        });

        // Handle UNSUPPORTED_SCHEME error specifically
        if (error.code === 1000) {
          const uri = error.data[0];
          console.error('Unsupported URI scheme:', uri);
          setError({
            message: 'Stream URL format not supported. Please check the URL format.',
            details: `URI: ${uri}`
          });
          return;
        }

        setError(error);
      });

      // Configure player with updated settings
      player.configure({
        streaming: {
          // Reduce buffering delays
          bufferingGoal: 60,
          rebufferingGoal: 20,
          bufferBehind: 30,
          // Aggressive retry settings
          retryParameters: {
            maxAttempts: 5,
            baseDelay: 1000,
            backoffFactor: 2,
            fuzzFactor: 0.5,
            timeout: 30000, // 30 seconds timeout
          },
          // Remove deprecated options
          useNativeHlsOnSafari: true
        },
        abr: {
          enabled: true,
          defaultBandwidthEstimate: 1000000, // 1Mbps initial estimate
          switchInterval: 8,
          bandwidthUpgradeTarget: 0.85,
          bandwidthDowngradeTarget: 0.95
        },
        manifest: {
          retryParameters: {
            maxAttempts: 5,
            baseDelay: 1000,
            backoffFactor: 2,
            fuzzFactor: 0.5,
            timeout: 30000
          },
          dash: {
            // Remove unsupported options
            xlinkFailGracefully: true,
            ignoreMinBufferTime: true,
            autoCorrectDrift: true
          }
        }
      });

      // Configure DRM if provided
      if (drmConfig && drmConfig.keyId && drmConfig.key) {
        console.log('Configuring DRM with:', {
          keyId: drmConfig.keyId,
          key: drmConfig.key
        });

        player.configure({
          drm: {
            clearKeys: {
              [drmConfig.keyId]: drmConfig.key
            },
            servers: {
              'org.w3.clearkey': 'https://clearkey-license-server.com/license'
            }
          }
        });
      }

      try {
        console.log('Loading manifest:', url);
        
        // Add request filters for headers if needed
        player.getNetworkingEngine().registerRequestFilter((type, request) => {
          // Ensure proper URI scheme
          if (!request.uris || request.uris.length === 0) return;
          
          // Convert URI to proper format if needed
          request.uris = request.uris.map(uri => {
            // Ensure HTTPS for manifest and segments
            if (uri.startsWith('http://')) {
              uri = 'https://' + uri.substring(7);
            }
            return uri;
          });

          // Add required headers for Fancode streams
          request.headers = {
            ...request.headers,
            'Origin': 'https://www.fancode.com',
            'Referer': 'https://www.fancode.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': navigator.userAgent,
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9'
          };
        });

        // Add response filter to handle CORS
        player.getNetworkingEngine().registerResponseFilter((type, response) => {
          // Add CORS headers if missing
          if (!response.headers['access-control-allow-origin']) {
            response.headers['access-control-allow-origin'] = '*';
          }
        });

        // Ensure URL is properly formatted
        let manifestUrl = url;
        if (!manifestUrl.startsWith('http://') && !manifestUrl.startsWith('https://')) {
          manifestUrl = 'https://' + manifestUrl;
        }

        await player.load(manifestUrl);
        console.log('Manifest loaded successfully');
        
        // Get available video tracks
        const tracks = player.getVariantTracks();
        console.log('Available video tracks:', tracks);

        // Set up quality options for the menu
        const qualityLevels = tracks.map((track, index) => ({
          index,
          height: track.height || 0,
          bitrate: track.bandwidth,
          label: track.height ? `${track.height}p` : `${Math.round(track.bandwidth / 1000)} kbps`
        }));
        setQualities(qualityLevels);

        // Select the highest bandwidth variant by default
        tracks.sort((a, b) => b.bandwidth - a.bandwidth);
        if (tracks.length > 0) {
          player.configure('abr.enabled', false);
          player.selectVariantTrack(tracks[0]);
          setCurrentQuality(0); // Set initial quality selection
        }

        // Add track change handler
        player.addEventListener('variantchanged', () => {
          const activeTrack = player.getVariantTracks().find(t => t.active);
          if (activeTrack) {
            const activeIndex = tracks.findIndex(t => t.id === activeTrack.id);
            setCurrentQuality(activeIndex);
          }
        });

        // Attempt autoplay
        try {
          await video.play();
          console.log('Playback started successfully');
        } catch (error) {
          console.log('Autoplay failed:', error);
          if (error.name === 'NotAllowedError') {
            console.log('Autoplay not allowed, waiting for user interaction');
          }
        }
      } catch (error) {
        console.error('Error loading manifest:', error);
        throw error;
      }
    } catch (error) {
      console.error('Shaka player initialization error:', error);
      setError({
        message: 'Failed to initialize video player: ' + (error.message || 'Unknown error'),
        details: error
      });
    }
  };

  // Initialize player based on content type
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    // Cleanup previous instances
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (shakaPlayerRef.current) {
      shakaPlayerRef.current.destroy();
      shakaPlayerRef.current = null;
    }

    setError(null);

    // Initialize appropriate player based on content type
    if (type === 'dashmpd') {
      console.log('Initializing Shaka Player for DASH content');
      initShaka();
    } else if (type === 'm3u8') {
      console.log('Initializing HLS.js for HLS content');
      if (Hls.isSupported()) {
        const hls = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
                autoStartLoad: true,
          manifestLoadingMaxRetry: 2,
          manifestLoadingRetryDelay: 500,
          manifestLoadingMaxRetryTimeout: 5000,
          levelLoadingMaxRetry: 2,
          levelLoadingRetryDelay: 500,
          levelLoadingMaxRetryTimeout: 5000,
          fragLoadingMaxRetry: 2,
          fragLoadingRetryDelay: 500,
          fragLoadingMaxRetryTimeout: 5000,
        });

        hlsRef.current = hls;

        // Handle HLS events
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('HLS.js media attached');
        });

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log('HLS manifest parsed, found ' + data.levels.length + ' quality levels');
          setQualities(data.levels.map((level, index) => ({
            index,
            height: level.height,
            bitrate: level.bitrate
          })));
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('Fatal HLS error:', data);
            setError(data);
          }
        });

        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Fallback to native HLS for Safari
        video.src = url;
      }
    } else if (type === 'iframe') {
      // Iframe handling remains unchanged
      console.log('Using iframe for content');
    }

    // Cleanup
      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
      }
      if (shakaPlayerRef.current) {
        shakaPlayerRef.current.destroy();
      }
    };
  }, [url, type, drmConfig]);

  // Check PiP support
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      setIsPiPSupported(
        document.pictureInPictureEnabled ||
        typeof video.requestPictureInPicture === 'function' ||
        // For Safari
        typeof video.webkitSupportsPresentationMode === 'function'
      );
    }
  }, []);

  // Add click handler to fullscreen button
  useEffect(() => {
    // Wait for DOM to be ready
    setTimeout(() => {
      const fullscreenButton = document.getElementById('fullscreen-button');
      if (fullscreenButton) {
        fullscreenButton.addEventListener('click', () => {
          // Try to force landscape orientation after a short delay
          setTimeout(() => {
            try {
              if (window.screen && window.screen.orientation && typeof window.screen.orientation.lock === 'function') {
                window.screen.orientation.lock('landscape').catch(err => {
                  console.log('Could not lock orientation on click:', err);
                });
              }
            } catch (err) {
              console.log('Error forcing orientation on click:', err);
            }
          }, 500); // Short delay to allow fullscreen to activate first
        });
      }
    }, 1000); // Wait for component to fully mount
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    // Create a style element for fullscreen CSS
    if (!styleTagRef.current) {
      const style = document.createElement('style');
      style.innerHTML = `
        /* Force landscape orientation in fullscreen on mobile */
        @media screen and (max-width: 768px) {
          /* Target the container itself */
          .video-container:fullscreen,
          .video-container:-webkit-full-screen,
          .video-container:-moz-full-screen,
          .video-container:-ms-fullscreen {
            transform: rotate(90deg) !important;
            transform-origin: center center !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vh !important;
            height: 100vw !important;
            max-width: none !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 9999 !important;
          }

          /* Target the video element */
          .video-container:fullscreen video,
          .video-container:-webkit-full-screen video,
          .video-container:-moz-full-screen video,
          .video-container:-ms-fullscreen video {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            max-width: none !important;
            max-height: none !important;
          }

          /* Target the media controller */
          .video-container:fullscreen media-controller,
          .video-container:-webkit-full-screen media-controller,
          .video-container:-moz-full-screen media-controller,
          .video-container:-ms-fullscreen media-controller {
            width: 100% !important;
            height: 100% !important;
          }

          /* Target the control bar */
          .video-container:fullscreen media-control-bar,
          .video-container:-webkit-full-screen media-control-bar,
          .video-container:-moz-full-screen media-control-bar,
          .video-container:-ms-fullscreen media-control-bar {
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 10000 !important;
          }
        }
      `;
      document.head.appendChild(style);
      styleTagRef.current = style;
    }

    // Detect fullscreen changes
    const handleFullscreenChange = () => {
      // Detect fullscreen state
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      console.log('Fullscreen state changed:', isFullscreen);

      // Try to force orientation on fullscreen
      if (isFullscreen) {
        try {
          // Try screen orientation API
          if (window.screen && window.screen.orientation && typeof window.screen.orientation.lock === 'function') {
            window.screen.orientation.lock('landscape').catch(err => {
              console.log('Could not lock orientation:', err);
            });
          }
          // Try older iOS specific method
          else if (document.documentElement.webkitRequestFullScreen) {
            document.documentElement.webkitRequestFullScreen();
          }
        } catch (err) {
          console.log('Error forcing orientation:', err);
        }
      } else {
        // Release orientation lock when exiting fullscreen
        try {
          if (window.screen && window.screen.orientation && typeof window.screen.orientation.unlock === 'function') {
            window.screen.orientation.unlock();
          }
        } catch (err) {
          console.log('Error unlocking orientation:', err);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

      // Clean up style tag on unmount
      if (styleTagRef.current) {
        document.head.removeChild(styleTagRef.current);
        styleTagRef.current = null;
      }
    };
  }, []);

  // Add function to handle unmuting
  const handleUnmute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  // Add click handler for unmuting
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleClick = () => {
        if (isMuted) {
          handleUnmute();
        }
      };
      video.addEventListener('click', handleClick);
      return () => video.removeEventListener('click', handleClick);
    }
  }, [isMuted]);

  return (
    <Box
      ref={containerRef}
      className="video-container"
      width="100%"
      height={{ base: "auto", md: "calc(100vh - 80px)" }}
      maxH={{ base: "none", md: "calc(100vh - 80px)" }}
      bg="black"
      position="relative"
      overflow="hidden"
      my={{ base: 0, md: 6 }}
      sx={{
        '&:fullscreen': {
          transform: 'rotate(90deg)',
          transformOrigin: 'center center',
          width: '100vh',
          height: '100vw',
        },
        '&::-webkit-full-screen': {
          transform: 'rotate(90deg)',
          transformOrigin: 'center center',
          width: '100vh',
          height: '100vw',
        },
        '&:-ms-fullscreen': {
          transform: 'rotate(90deg)',
          transformOrigin: 'center center',
          width: '100vh',
          height: '100vw',
        }
      }}
    >
      <media-controller
        ref={mediaControllerRef}
        style={{
          width: '100%',
          height: '100%',
          aspectRatio: '16/9',
          '--media-primary-color': 'white',
          '--media-secondary-color': 'rgba(255, 255, 255, 0.7)',
          '--media-loading-icon-color': 'white',
          '--media-control-background': 'rgba(0, 0, 0, 0.7)',
          '--media-control-hover-background': 'rgba(0, 0, 0, 0.85)',
          '--media-time-range-buffered-color': 'rgba(255, 255, 255, 0.4)',
          '--media-range-thumb-color': 'white',
          '--media-range-track-color': 'rgba(255, 255, 255, 0.2)',
          '--media-button-icon-color': 'white',
          '--media-button-icon-hover-color': 'rgba(255, 255, 255, 0.9)',
          '--media-button-icon-active-color': 'rgba(255, 255, 255, 0.8)',
          '--media-time-display-color': 'white',
          '--media-control-padding': controlsSpacing,
          '--media-button-icon-width': buttonSize === 'xs' ? '24px' : '32px',
          '--media-button-icon-height': buttonSize === 'xs' ? '24px' : '32px',
        }}
      >
        <video
          ref={videoRef}
          slot="media"
          playsInline
          muted={isMuted}
          crossOrigin="anonymous"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            objectFit: 'contain',
          }}
        />

        {/* Add unmute overlay if muted */}
        {isMuted && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg="rgba(0, 0, 0, 0.7)"
            color="white"
            px={4}
            py={2}
            borderRadius="md"
            cursor="pointer"
            onClick={handleUnmute}
            zIndex={2}
          >
            Click to Unmute
          </Box>
        )}

        <media-control-bar>
          <media-play-button></media-play-button>
          <media-seek-backward-button seek-offset="10"></media-seek-backward-button>
          <media-seek-forward-button seek-offset="10"></media-seek-forward-button>
          <media-time-range></media-time-range>
          {showTimeDisplay && <media-time-display></media-time-display>}
          <media-mute-button onClick={() => setIsMuted(prev => !prev)}></media-mute-button>
          {showVolumeRange && <media-volume-range></media-volume-range>}

          {/* Quality Selection */}
          {qualities.length > 1 && (
            <Menu placement="top" offset={[0, 4]} strategy="fixed">
              <MenuButton
                as={Button}
                size={buttonSize}
                rightIcon={<ChevronDownIcon />}
                bg="transparent"
                color="var(--media-button-icon-color)"
                _hover={{
                  bg: 'var(--media-control-hover-background)',
                  color: 'var(--media-button-icon-hover-color)'
                }}
                _active={{
                  bg: 'var(--media-control-hover-background)',
                  color: 'var(--media-button-icon-active-color)'
                }}
                height="var(--media-button-height, 48px)"
                minW="auto"
                margin="0"
                padding="0 8px"
              >
                {currentQuality === -1 ? 'Auto' : `${qualities[currentQuality]?.height}p`}
              </MenuButton>
              <MenuList
                bg="var(--media-control-background)"
                borderColor="whiteAlpha.200"
                maxH="200px"
                overflowY="auto"
                w="auto"
                minW="150px"
                sx={{
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    bg: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bg: 'whiteAlpha.300',
                    borderRadius: 'full',
                  },
                  '@media screen and (max-width: 480px)': {
                    minW: '120px',
                    maxH: '180px',
                    fontSize: 'sm',
                  }
                }}
              >
                <MenuItem
                  onClick={() => handleQualityChange(-1)}
                  bg="transparent"
                  color="var(--media-button-icon-color)"
                  _hover={{ bg: 'var(--media-control-hover-background)' }}
                  fontSize={{ base: 'sm', sm: 'md' }}
                  h={{ base: '32px', sm: '40px' }}
                >
                  Auto
                </MenuItem>
                {qualities.map((quality) => (
                  <MenuItem
                    key={quality.index}
                    onClick={() => handleQualityChange(quality.index)}
                    fontSize={{ base: 'sm', sm: 'md' }}
                    bg="transparent"
                    color="var(--media-button-icon-color)"
                    _hover={{ bg: 'var(--media-control-hover-background)' }}
                    h={{ base: '32px', sm: '40px' }}
                  >
                    {quality.height}p ({Math.round(quality.bitrate / 1000)} kbps)
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          )}

          {/* Audio Track Selection */}
          {audioTracks.length > 1 && (
            <Menu>
              <MenuButton
                as={Button}
                size={buttonSize}
                rightIcon={<ChevronDownIcon />}
                bg="transparent"
                color="var(--media-button-icon-color)"
                _hover={{
                  bg: 'var(--media-control-hover-background)',
                  color: 'var(--media-button-icon-hover-color)'
                }}
                _active={{
                  bg: 'var(--media-control-hover-background)',
                  color: 'var(--media-button-icon-active-color)'
                }}
                height="var(--media-button-height, 48px)"
                minW="auto"
                margin="0"
                padding="0 8px"
              >
                {audioTracks[currentAudio]?.name || 'Audio'}
              </MenuButton>
              <MenuList
                bg="var(--media-control-background)"
                borderColor="whiteAlpha.200"
                minW="auto"
                sx={{
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    bg: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bg: 'whiteAlpha.300',
                    borderRadius: 'full',
                  },
                }}
              >
                {audioTracks.map((track, index) => (
                  <MenuItem
                    key={track.id}
                    onClick={() => handleAudioChange(index)}
                    fontSize={buttonSize === 'xs' ? 'sm' : 'md'}
                    bg="transparent"
                    color="var(--media-button-icon-color)"
                    _hover={{ bg: 'var(--media-control-hover-background)' }}
                  >
                    {track.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          )}

          {/* Playback Rate - Hidden on mobile */}
          {showPlaybackRate && (
            <media-playback-rate-button></media-playback-rate-button>
          )}

          {/* PiP Button - Show if supported */}
          {isPiPSupported && (
            <media-pip-button></media-pip-button>
          )}

          <media-fullscreen-button id="fullscreen-button" onClick={handleFullscreenClick}></media-fullscreen-button>
        </media-control-bar>

        {/* Add PiP support for Safari */}
        {isPiPSupported && (
          <style>
            {`
              video::-webkit-media-controls-pip-button {
                display: none !important;
              }
            `}
          </style>
        )}

        {/* Error Overlay - Now persistent */}
        {streamError && (
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            bg="blackAlpha.700"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="10"
            pointerEvents="all"
          >
            <VStack spacing={4} maxW="80%" textAlign="center">
              <Alert
                status="error"
                variant="solid"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                borderRadius="md"
                p={4}
              >
                <AlertIcon boxSize="2rem" />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  Stream Not Available
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                  This stream is not working. Please select a different stream from the options below.
                </AlertDescription>
              </Alert>
            </VStack>
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            bg="blackAlpha.700"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="10"
          >
            <Alert status="error" variant="solid" maxW="400px">
              <AlertIcon />
              <Box>
                <AlertTitle>Playback Error</AlertTitle>
                <AlertDescription>
                  {error.message || 'Failed to play video. Please try another source.'}
                </AlertDescription>
              </Box>
            </Alert>
          </Box>
        )}
      </media-controller>
    </Box>
  );
};

export default VideoPlayer;