import axios from 'axios';
import { env } from '../../scripts/loadEnv.js';
import https from 'https';

const BASE_URL = env.VITE_FRONTEND_URL;
const API_URL = env.VITE_API_URL;
console.log(BASE_URL, API_URL);

// Create axios instance with SSL verification disabled for IP addresses
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
});

export const generateSitemap = async () => {
  try {
    // Fetch all matches
    const matchesRes = await axiosInstance.get(`${API_URL}/matches`);
    const matches = matchesRes.data;

    // Fetch all categories
    const categoriesRes = await axiosInstance.get(`${API_URL}/categories`);
    const categories = categoriesRes.data;

    // Fetch all blogs
    const blogsRes = await axiosInstance.get(`${API_URL}/blogs`);
    const blogs = blogsRes.data;

    // Static routes
    const staticRoutes = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/categories', changefreq: 'weekly', priority: 0.8 },
      { url: '/live', changefreq: 'daily', priority: 0.9 },
      { url: '/blogs', changefreq: 'weekly', priority: 0.7 },
    ];

    // Dynamic routes from matches
    const matchRoutes = matches.map(match => ({
      url: `/match/${match._id}`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date(match.updatedAt).toISOString(),
    }));

    // Dynamic routes from categories
    const categoryRoutes = categories.map(category => ({
      url: `/category/${category.slug}`,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(category.updatedAt).toISOString(),
    }));

    // Dynamic routes from blogs
    const blogRoutes = blogs.map(blog => ({
      url: `/blogs/${blog.slug}`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: new Date(blog.updatedAt).toISOString(),
    }));

    // Combine all routes
    const allRoutes = [...staticRoutes, ...matchRoutes, ...categoryRoutes, ...blogRoutes];

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes.map(route => `
  <url>
    <loc>${BASE_URL}${route.url}</loc>
    ${route.lastmod ? `<lastmod>${route.lastmod}</lastmod>` : ''}
    ${route.changefreq ? `<changefreq>${route.changefreq}</changefreq>` : ''}
    ${route.priority ? `<priority>${route.priority}</priority>` : ''}
  </url>`).join('')}
</urlset>`;

    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}; 