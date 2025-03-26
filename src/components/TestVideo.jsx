import React from 'react';
import VideoPlayer from './VideoPlayer';

const TestVideo = () => {
  // Test URL - replace with your actual Google SSAI URL
  const testUrl = 'https://dai.google.com/ssai/event/DD7fA-HgSUaLyZp9AjRYxQ/master.m3u8';

  return (
    <div style={{ padding: '20px' }}>
      <h1>Video Player Test</h1>
      <p>Testing URL: {testUrl}</p>
      <p>Proxied URL: {`${import.meta.env.VITE_API_URL}/stream/DD7fA-HgSUaLyZp9AjRYxQ/master.m3u8`}</p>
      <VideoPlayer url={testUrl} />
    </div>
  );
};

export default TestVideo; 