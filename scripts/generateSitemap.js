import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define your website URL and API URL
const WEBSITE_URL = 'https://crickflix.in';
const API_URL = process.env.VITE_API_URL;

// Define static routes
const staticRoutes = [
  {
    url: '/',
    priority: '1.0',
    changefreq: 'daily'
  },
  {
    url: '/blogs',
    priority: '0.8',
    changefreq: 'daily'
  },
  {
    url: '/live',
    priority: '0.9',
    changefreq: 'hourly'
  },
  {
    url: '/categories',
    priority: '0.8',
    changefreq: 'daily'
  },
  {
    url: '/help',
    priority: '0.7',
    changefreq: 'weekly'
  }
];

// Fetch all dynamic routes
const fetchDynamicRoutes = async () => {
  try {
    // Fetch all data in parallel
    const [matches, blogs, categories] = await Promise.all([
      axios.get(`${API_URL}/matches`),
      axios.get(`${API_URL}/blogs`),
      axios.get(`${API_URL}/categories`)
    ]);

    const dynamicRoutes = [
      // Add match pages
      ...matches.data.map(match => ({
        url: `/match/${match._id}`,
        priority: match.status === 'live' ? '1.0' : '0.9',
        changefreq: match.status === 'live' ? 'hourly' : 'daily',
        lastmod: match.updatedAt
      })),

      // Add blog pages
      ...blogs.data.map(blog => ({
        url: `/blogs/${blog.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: blog.updatedAt
      })),

      // Add category pages
      ...categories.data.map(category => ({
        url: `/category/${category.slug}`,
        priority: '0.8',
        changefreq: 'daily',
        lastmod: category.updatedAt
      }))
    ];

    return dynamicRoutes;
  } catch (error) {
    console.error('Error fetching dynamic routes:', error);
    return [];
  }
};

// Generate sitemap XML content
const generateSitemap = async () => {
  const dynamicRoutes = await fetchDynamicRoutes();
  const allRoutes = [...staticRoutes, ...dynamicRoutes];
  
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes
    .map(route => `
    <url>
      <loc>${WEBSITE_URL}${route.url}</loc>
      <lastmod>${route.lastmod || new Date().toISOString()}</lastmod>
      <changefreq>${route.changefreq}</changefreq>
      <priority>${route.priority}</priority>
    </url>`)
    .join('')}
</urlset>`;

  return sitemapContent;
};

// Write sitemap to file
const writeSitemap = async () => {
  try {
    const distPath = path.resolve(__dirname, '../dist');
    const sitemapPath = path.join(distPath, 'sitemap.xml');
    
    // Create dist directory if it doesn't exist
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }

    // Generate and write sitemap
    const sitemap = await generateSitemap();
    fs.writeFileSync(sitemapPath, sitemap);
    console.log(`✅ Sitemap generated successfully at ${sitemapPath}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
};

// Run the sitemap generator
writeSitemap(); 