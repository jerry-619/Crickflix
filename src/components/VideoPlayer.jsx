import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
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

const VideoPlayer = ({ url }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
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

  const handleQualityChange = (levelIndex) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex;
    setCurrentQuality(levelIndex);
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

  // Initialize HLS player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    if (playAttemptTimeoutRef.current) {
      clearTimeout(playAttemptTimeoutRef.current);
    }

    setStreamError(false);
    setRetryCount(0);
    setIsPlaying(false);

    let playbackFailureCount = 0;
    let lastPlaybackTime = 0;
    let playbackStallCheckInterval;
    let isDestroyed = false;
    let loadTimeout = null;

    const initPlayer = async () => {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

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

        // Set a timeout to show error if stream doesn't load
        loadTimeout = setTimeout(() => {
          if (!isDestroyed && !isPlaying) {
            setStreamError(true);
          }
        }, 10000);

        const handleStreamError = () => {
          if (isDestroyed) return;
          
          setRetryCount(prev => {
            const newCount = prev + 1;
            if (newCount >= MAX_RETRIES) {
              setStreamError(true);
              setIsPlaying(false);
            } else {
              playAttemptTimeoutRef.current = setTimeout(() => {
                if (!isDestroyed) {
                  hls.startLoad();
                  attemptPlay(video);
                }
              }, 1000);
            }
            return newCount;
          });
        };

        // Error handling
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.log('HLS Error:', data);
          if (data.fatal || data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            handleStreamError();
          }
        });

        // Monitor playback
        const startPlaybackMonitoring = () => {
          if (playbackStallCheckInterval) {
            clearInterval(playbackStallCheckInterval);
          }

          playbackStallCheckInterval = setInterval(() => {
            if (!video.paused && !streamError) {
              if (video.currentTime === lastPlaybackTime) {
                playbackFailureCount++;
                if (playbackFailureCount >= 2) {  // Reduced from 3 to 2
                  handleStreamError();
                  playbackFailureCount = 0;
                }
              } else {
                playbackFailureCount = 0;
                lastPlaybackTime = video.currentTime;
              }
            }
          }, 1500);  // Reduced from 2000 to 1500
        };

        // Load source and attach media
        hls.loadSource(url);
        hls.attachMedia(video);

        // Handle manifest parsed
        hls.on(Hls.Events.MANIFEST_PARSED, async (_, data) => {
          if (loadTimeout) {
            clearTimeout(loadTimeout);
          }

          const qualityLevels = data.levels.map((level, index) => ({
            index,
            height: level.height || level.width?.height,
            bitrate: level.bitrate
          })).filter(level => level.height);

          if (qualityLevels.length > 1) {
            setQualities(qualityLevels);
            setCurrentQuality(hls.currentLevel);
          } else {
            setQualities([]);
          }

          const tracks = hls.audioTracks || [];
          setAudioTracks(tracks);
          setCurrentAudio(hls.audioTrack);

          // Attempt autoplay
          const playSuccess = await attemptPlay(video);
          if (!playSuccess && !isDestroyed) {
            setStreamError(true);
          }
        });

        // Event listeners
        video.addEventListener('playing', () => {
          setIsPlaying(true);
          setStreamError(false);
          startPlaybackMonitoring();
        });

        video.addEventListener('pause', () => {
          setIsPlaying(false);
        });

        video.addEventListener('error', () => {
          console.log('Video error:', video.error);
          handleStreamError();
        });

        video.addEventListener('stalled', () => {
          console.log('Stream stalled');
          handleStreamError();
        });

        video.addEventListener('waiting', () => {
          if (!streamError) {
            playAttemptTimeoutRef.current = setTimeout(() => {
              if (video.readyState < 3) {
                console.log('Stream waiting too long');
                handleStreamError();
              }
            }, 5000);
          }
        });
      }
      // Safari native HLS support
      else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', async () => {
          const playSuccess = await attemptPlay(video);
          if (!playSuccess && !isDestroyed) {
            setStreamError(true);
          }
        });
      }
    };

    initPlayer();

    // Cleanup
    return () => {
      isDestroyed = true;
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
      if (playAttemptTimeoutRef.current) {
        clearTimeout(playAttemptTimeoutRef.current);
      }
      if (playbackStallCheckInterval) {
        clearInterval(playbackStallCheckInterval);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [url]);

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
                {currentQuality === -1 ? 'Auto' : `${qualities[currentQuality]?.height}p`}
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
                <MenuItem
                  onClick={() => handleQualityChange(-1)}
                  bg="transparent"
                  color="var(--media-button-icon-color)"
                  _hover={{ bg: 'var(--media-control-hover-background)' }}
                >
                  Auto
                </MenuItem>
                {qualities.map((quality) => (
                  <MenuItem
                    key={quality.index}
                    onClick={() => handleQualityChange(quality.index)}
                    fontSize={buttonSize === 'xs' ? 'sm' : 'md'}
                    bg="transparent"
                    color="var(--media-button-icon-color)"
                    _hover={{ bg: 'var(--media-control-hover-background)' }}
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
      </media-controller>
    </Box>
  );
};

export default VideoPlayer;