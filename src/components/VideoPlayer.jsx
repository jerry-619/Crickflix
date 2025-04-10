import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Box, useBreakpointValue } from '@chakra-ui/react';
import 'media-chrome';

const VideoPlayer = ({ url }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);
  const mediaControllerRef = useRef(null);
  // Responsive controls based on screen size
  const showVolumeRange = useBreakpointValue({ base: false, md: true });
  const showTimeDisplay = useBreakpointValue({ base: false, sm: true });

  // Add a style tag to force landscape in fullscreen
  const styleTagRef = useRef(null);

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

  // Initialize HLS player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    // Initialize HLS if supported
    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(url);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(error => {
          console.log('Autoplay prevented:', error);
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
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
    }
    // For Safari which has native HLS support
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(error => {
          console.log('Autoplay prevented:', error);
        });
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

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

        {/* Simple Media Chrome Controls */}
        <media-control-bar>
          <media-play-button></media-play-button>
          <media-seek-backward-button seek-offset="10"></media-seek-backward-button>
          <media-seek-forward-button seek-offset="10"></media-seek-forward-button>
          <media-time-range></media-time-range>
          {showTimeDisplay && <media-time-display></media-time-display>}
          <media-mute-button></media-mute-button>
          {showVolumeRange && <media-volume-range></media-volume-range>}
          <media-fullscreen-button id="fullscreen-button" onClick={handleFullscreenClick}></media-fullscreen-button>
        </media-control-bar>
      </media-controller>
    </Box>
  );
};

export default VideoPlayer;