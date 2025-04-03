import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue,
  useBreakpointValue,
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

  // Responsive controls based on screen size
  const showVolumeRange = useBreakpointValue({ base: false, md: true });
  const showTimeDisplay = useBreakpointValue({ base: false, sm: true });
  const showPlaybackRate = useBreakpointValue({ base: false, sm: true });
  const buttonSize = useBreakpointValue({ base: "xs", sm: "sm" });
  const controlsSpacing = useBreakpointValue({ base: "0.5rem", sm: "1rem" });

  // Check if PiP is supported
  const [isPiPSupported, setIsPiPSupported] = useState(false);

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    const initPlayer = () => {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          maxBufferSize: 60 * 1000 * 1000,
          maxBufferHole: 0.5,
          highBufferWatchdogPeriod: 2,
          nudgeOffset: 0.1,
          nudgeMaxRetry: 5,
          maxFragLookUpTolerance: 0.25,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
          liveDurationInfinity: true,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
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

          video.play().catch(error => {
            console.log('Playback not started', error);
          });
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          setCurrentQuality(data.level);
        });

        hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
          setCurrentAudio(data.id);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

        hls.loadSource(url);
        hls.attachMedia(video);
        hlsRef.current = hls;

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(error => {
            console.log('Playback not started', error);
          });
        });
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  useEffect(() => {
    // Check PiP support
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

  const primaryColor = useColorModeValue('white', 'white');
  const menuBg = useColorModeValue('white', 'gray.700');

  return (
    <Box 
      width="100%" 
      maxW="100vw" 
      height={{ base: "auto", md: "calc(100vh - 80px)" }}
      maxH={{ base: "none", md: "calc(100vh - 80px)" }}
      bg="black" 
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      my={{ base: 0, md: 6 }}
      sx={{
        '&:fullscreen': {
          height: '100vh',
          maxHeight: '100vh',
          margin: 0,
          padding: 0,
        },
        '&::-webkit-full-screen': {
          height: '100vh',
          maxHeight: '100vh',
          margin: 0,
          padding: 0,
        },
        '&:-ms-fullscreen': {
          height: '100vh',
          maxHeight: '100vh',
          margin: 0,
          padding: 0,
        }
      }}
    >
      <media-controller
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
          crossOrigin="anonymous"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            objectFit: 'contain',
          }}
        />

        {/* Media Chrome Controls */}
        <media-control-bar>
          <media-play-button></media-play-button>
          <media-seek-backward-button seek-offset="10"></media-seek-backward-button>
          <media-seek-forward-button seek-offset="10"></media-seek-forward-button>
          <media-time-range></media-time-range>
          {showTimeDisplay && <media-time-display></media-time-display>}
          <media-mute-button></media-mute-button>
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

          <media-fullscreen-button></media-fullscreen-button>
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
      </media-controller>
    </Box>
  );
};

export default VideoPlayer; 