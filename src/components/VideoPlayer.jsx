import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import {
  Box,
  AspectRatio,
} from '@chakra-ui/react';

const VideoPlayer = ({ url }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

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
          video.play().catch(error => {
            console.log('Playback not started', error);
          });
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
      </AspectRatio>
    </Box>
  );
};

export default VideoPlayer; 