import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  ogTitle, 
  ogDescription, 
  twitterTitle, 
  twitterDescription, 
  twitterImage,
  canonicalUrl,
  structuredData
}) => {
  const siteName = 'CrickFlix';
  const defaultDescription = 'Watch live cricket streaming in HD quality - IPL 2025, International matches, T20 World Cup, Test matches & more. Get live scores, match highlights, and expert commentary.';
  const defaultKeywords = 'live cricket streaming, IPL 2025 live, cricket live match today, live cricket score, international cricket live, T20 World Cup 2025, Test cricket live streaming, cricket highlights, cricket match live, free cricket streaming, HD cricket streaming, cricket online';
  const defaultImage = '/og-image.jpg';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title ? `${title} | ${siteName}` : siteName}</title>
      <meta name="title" content={title ? `${title} | ${siteName}` : siteName} />
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle || title || siteName} />
      <meta property="og:description" content={ogDescription || description || defaultDescription} />
      <meta property="og:image" content={ogImage || defaultImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={twitterTitle || title || siteName} />
      <meta property="twitter:description" content={twitterDescription || description || defaultDescription} />
      <meta property="twitter:image" content={twitterImage || defaultImage} />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO; 