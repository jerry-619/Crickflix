import { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import Hls from 'hls.js';
import 'plyr/dist/plyr.css';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

const CustomPlayer = ({ url, type = 'auto' }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const hlsRef = useRef(null);
  const [error, setError] = useState(null);
  const [streamInfo, setStreamInfo] = useState(null);

  useEffect(() => {
    let hls = null;

    const initPlayer = async () => {
      if (!videoRef.current) return;

      try {
        // Destroy existing instances
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        if (playerRef.current) {
          playerRef.current.destroy();
        }

        // Initialize Plyr with basic controls
        const player = new Plyr(videoRef.current, {
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'settings',
            'fullscreen',
          ],
          settings: ['quality', 'speed']
        });

        playerRef.current = player;

        // Handle HLS streams
        if (type === 'm3u8' || (type === 'auto' && url.includes('.m3u8'))) {
          if (Hls.isSupported()) {
            hls = new Hls({
              debug: true,
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 90,
              manifestLoadingTimeOut: 60000,
              manifestLoadingMaxRetry: 5,
              levelLoadingTimeOut: 60000,
              fragLoadingTimeOut: 60000,
              startLevel: -1,
              abrEwmaDefaultEstimate: 500000,
              testBandwidth: true,
              progressive: true,
              enableSoftwareAES: true
            });

            // Log all HLS events
            Object.values(Hls.Events).forEach(eventName => {
              hls.on(eventName, (event, data) => {
                console.log(`HLS Event [${eventName}]:`, data);
              });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error('HLS error:', data);
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.log('Network error, attempting to recover...');
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.log('Media error, attempting to recover...');
                    hls.recoverMediaError();
                    break;
                  default:
                    console.error('Unrecoverable error');
                    hls.destroy();
                    break;
                }
              }
            });

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
              console.log('Manifest parsed:', data);
              console.log('Available levels:', hls.levels);
              
              const levels = hls.levels.map((level) => ({
                height: level.height,
                width: level.width,
                bitrate: level.bitrate,
                name: `${level.height}p`,
                codecSet: level.codecSet
              }));

              setStreamInfo({
                levels,
                currentLevel: hls.currentLevel,
                autoLevel: hls.autoLevelEnabled
              });

              // Set up quality options
              if (levels.length > 0) {
                player.quality = {
                  default: levels[levels.length - 1].height,
                  options: levels.map(l => l.height),
                  forced: true,
                  onChange: (newQuality) => {
                    hls.levels.forEach((level, levelIndex) => {
                      if (level.height === newQuality) {
                        hls.currentLevel = levelIndex;
                      }
                    });
                  }
                };
              }

              videoRef.current.play().catch(e => {
                console.warn('Autoplay prevented:', e);
              });
            });

            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
              console.log('Quality level switched:', {
                level: data.level,
                details: hls.levels[data.level]
              });
            });

            hls.on(Hls.Events.AUDIO_TRACK_LOADED, (event, data) => {
              console.log('Audio track loaded:', data);
            });

            hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
              console.log('Fragment loaded:', {
                type: data.frag.type,
                level: data.frag.level,
                sn: data.frag.sn,
                start: data.frag.start,
                duration: data.frag.duration
              });
            });

            // Load source after setting up all event handlers
            hls.loadSource(url);
            hls.attachMedia(videoRef.current);
            hlsRef.current = hls;

          } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            // For Safari
            videoRef.current.src = url;
            videoRef.current.addEventListener('loadedmetadata', () => {
              videoRef.current.play();
            });
          }
        } else {
          // For other video types
          videoRef.current.src = url;
        }

      } catch (err) {
        console.error('Error initializing player:', err);
        setError('Failed to initialize video player. Please try again.');
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [url, type]);

  return (
    <Box position="relative" width="100%" height="100%">
      {error && (
        <Alert
          status="error"
          variant="solid"
          position="absolute"
          top="4"
          left="50%"
          transform="translateX(-50%)"
          zIndex="tooltip"
          maxW="md"
        >
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {streamInfo && (
        <Alert
          status="info"
          variant="solid"
          position="absolute"
          top="4"
          left="50%"
          transform="translateX(-50%)"
          zIndex="tooltip"
          maxW="md"
        >
          <AlertIcon />
          <AlertTitle>Stream Info</AlertTitle>
          <AlertDescription>
            Available qualities: {streamInfo.levels.map(l => l.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}
      <video
        ref={videoRef}
        className="plyr-react plyr"
        playsInline
        style={{
          width: '100%',
          height: '100%',
          '--plyr-color-main': '#00B5D8',
        }}
      />
    </Box>
  );
};

export default CustomPlayer; 