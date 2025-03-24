/**
 * Utility for handling logging based on environment
 */
const isDevelopment = () => {
  return process.env.NODE_ENV !== 'production' && 
         import.meta.env.MODE !== 'production' && 
         import.meta.env.PROD !== true;
};

const logger = {
  log: (...args) => {
    if (isDevelopment()) {
      console.log('[DEV]', ...args);
    }
  },
  error: (...args) => {
    if (isDevelopment()) {
      console.error('[DEV ERROR]', ...args);
    }
  },
  warn: (...args) => {
    if (isDevelopment()) {
      console.warn('[DEV WARN]', ...args);
    }
  },
  info: (...args) => {
    if (isDevelopment()) {
      console.info('[DEV INFO]', ...args);
    }
  }
};

// Log the current environment for debugging
if (isDevelopment()) {
  console.log('Current Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV
  });
}

export default logger; 