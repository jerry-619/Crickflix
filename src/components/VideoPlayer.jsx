import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Box,
  AspectRatio,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  Text,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

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
          debug: true,
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

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('HLS Media attached');
        });

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log('HLS Manifest parsed, found ' + data.levels.length + ' quality levels');
          
          // Set available quality levels only if there are multiple qualities
          const qualityLevels = data.levels.map((level, index) => ({
            index,
            height: level.height || level.width?.height,
            bitrate: level.bitrate
          })).filter(level => level.height); // Only include levels with height

          // Only set qualities if there are multiple quality levels
          if (qualityLevels.length > 1) {
            setQualities(qualityLevels);
            setCurrentQuality(hls.currentLevel);
          } else {
            setQualities([]);
          }

          // Set available audio tracks
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
          console.error('HLS Error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.log('Unrecoverable error');
                hls.destroy();
                break;
            }
          }
        });

        hls.loadSource(url);
        hls.attachMedia(video);
        hlsRef.current = hls;

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // For Safari
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

  return (
    <Box width="100vw" height="100%" bg="black" position="relative" left="50%" transform="translateX(-50%)">
      <AspectRatio ratio={16/9} width="100vw" maxW="100vw">
        <Box position="relative">
          <video
            ref={videoRef}
            controls
            playsInline
            style={{
              width: '100vw',
              height: '100%',
              backgroundColor: 'black',
              maxWidth: '100vw',
            }}
          />
          
          {/* Quality and Audio Controls */}
          <HStack 
            position="absolute" 
            bottom="100px"
            right="20px" 
            spacing={3}
            bg="rgba(0,0,0,0.8)"
            p={3}
            borderRadius="lg"
            boxShadow="0 0 10px rgba(0,0,0,0.5)"
            zIndex={1000}
            display={(qualities.length > 1 || audioTracks.length > 1) ? "flex" : "none"}
          >
            {qualities.length > 1 && (
              <Box>
                <Text color="white" fontSize="sm" mb={1}>Quality</Text>
                <Menu>
                  <MenuButton 
                    as={Button} 
                    rightIcon={<ChevronDownIcon />} 
                    size="md"
                    colorScheme="blue"
                    width="120px"
                  >
                    {currentQuality === -1 ? 'Auto' : `${qualities[currentQuality]?.height}p`}
                  </MenuButton>
                  <MenuList>
                    <MenuItem 
                      onClick={() => handleQualityChange(-1)}
                      fontWeight={currentQuality === -1 ? "bold" : "normal"}
                    >
                      Auto
                    </MenuItem>
                    {qualities.map((quality) => (
                      <MenuItem 
                        key={quality.index} 
                        onClick={() => handleQualityChange(quality.index)}
                        fontWeight={currentQuality === quality.index ? "bold" : "normal"}
                      >
                        {quality.height}p ({Math.round(quality.bitrate / 1000)} kbps)
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </Box>
            )}

            {audioTracks.length > 1 && (
              <Box>
                <Text color="white" fontSize="sm" mb={1}>Audio</Text>
                <Menu>
                  <MenuButton 
                    as={Button} 
                    rightIcon={<ChevronDownIcon />} 
                    size="md"
                    colorScheme="green"
                    width="120px"
                  >
                    {audioTracks[currentAudio]?.name || 'Audio'}
                  </MenuButton>
                  <MenuList>
                    {audioTracks.map((track, index) => (
                      <MenuItem 
                        key={track.id} 
                        onClick={() => handleAudioChange(index)}
                        fontWeight={currentAudio === index ? "bold" : "normal"}
                      >
                        {track.name}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </Box>
            )}
          </HStack>
        </Box>
      </AspectRatio>
    </Box>
  );
};

export default VideoPlayer; 