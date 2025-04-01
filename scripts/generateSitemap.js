import { generateSitemap } from '../src/utils/generateSitemap.js';
import fs from 'fs';
import path from 'path';
import { env } from './loadEnv.js';

const generateAndSaveSitemap = async () => {
  try {
    // Validate environment variables
    if (!env.VITE_FRONTEND_URL || !env.VITE_API_URL) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }

    const sitemap = await generateSitemap();
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    
    fs.writeFileSync(sitemapPath, sitemap);
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    process.exit(1);
  }
};

generateAndSaveSitemap(); 