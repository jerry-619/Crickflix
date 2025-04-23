import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define your website URL
const WEBSITE_URL = 'https://crickflix.vercel.app';

// Define your routes
const routes = [
  '/',
  '/blogs',
  '/help',
  '/matches',
  '/schedule',
  '/live',
  '/about'
];

// Generate sitemap XML content
const generateSitemap = () => {
  const today = new Date().toISOString();
  
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map(route => {
      const priority = route === '/' ? '1.0' : '0.8';
      return `
    <url>
      <loc>${WEBSITE_URL}${route}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${priority}</priority>
    </url>`;
    })
    .join('')}
</urlset>`;

  return sitemapContent;
};

// Write sitemap to file
const writeSitemap = () => {
  const distPath = path.resolve(__dirname, '../dist');
  const sitemapPath = path.join(distPath, 'sitemap.xml');
  
  // Create dist directory if it doesn't exist
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  // Write sitemap file
  fs.writeFileSync(sitemapPath, generateSitemap());
  console.log(`✅ Sitemap generated successfully at ${sitemapPath}`);
};

writeSitemap(); 