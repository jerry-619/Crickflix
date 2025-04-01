import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

export const env = {
  VITE_FRONTEND_URL: process.env.VITE_FRONTEND_URL,
  VITE_API_URL: process.env.VITE_API_URL
}; 