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

  const primaryColor = useColorModeValue('white', 'white');
  const menuBg = useColorModeValue('white', 'gray.700');

  return (
    <Box width="100%" maxW="100vw" bg="black" position="relative">
      <media-controller
        style={{
          width: '100%',
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
          }}
        />

        {/* Media Chrome Controls */}
        <media-control-bar>
          <media-play-button></media-play-button>
          <media-seek-backward-button seek-offset="10"></media-seek-backward-button>
          <media-seek-forward-button seek-offset="10"></media-seek-forward-button>
          <media-time-range></media-time-range>
          <media-time-display></media-time-display>
          <media-mute-button></media-mute-button>
          <media-volume-range></media-volume-range>
          
          {/* Quality Selection */}
          {qualities.length > 1 && (
            <Box mx={2} position="relative" display="inline-block">
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  rightIcon={<ChevronDownIcon />}
                  bg="transparent"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  _active={{ bg: 'whiteAlpha.300' }}
                >
                  {currentQuality === -1 ? 'Auto' : `${qualities[currentQuality]?.height}p`}
                </MenuButton>
                <MenuList bg={menuBg}>
                  <MenuItem onClick={() => handleQualityChange(-1)}>
                    Auto
                  </MenuItem>
                  {qualities.map((quality) => (
                    <MenuItem
                      key={quality.index}
                      onClick={() => handleQualityChange(quality.index)}
                    >
                      {quality.height}p ({Math.round(quality.bitrate / 1000)} kbps)
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Box>
          )}

          {/* Audio Track Selection */}
          {audioTracks.length > 1 && (
            <Box mx={2} position="relative" display="inline-block">
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  rightIcon={<ChevronDownIcon />}
                  bg="transparent"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  _active={{ bg: 'whiteAlpha.300' }}
                >
                  {audioTracks[currentAudio]?.name || 'Audio'}
                </MenuButton>
                <MenuList bg={menuBg}>
                  {audioTracks.map((track, index) => (
                    <MenuItem
                      key={track.id}
                      onClick={() => handleAudioChange(index)}
                    >
                      {track.name}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Box>
          )}

          <media-playback-rate-button></media-playback-rate-button>
          <media-pip-button></media-pip-button>
          <media-fullscreen-button></media-fullscreen-button>
        </media-control-bar>
      </media-controller>
    </Box>
  );
};

export default VideoPlayer; 