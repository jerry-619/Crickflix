import { Helmet } from 'react-helmet-async';
import { Box } from '@chakra-ui/react';

const SEO = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  canonicalUrl,
  structuredData,
  hiddenH1
}) => {
  // Constants for SEO limits
  const TITLE_MAX_LENGTH = 60;
  const DESC_MAX_LENGTH = 160;
  const KEYWORDS_MAX_LENGTH = 200;
  const DOMAIN = 'https://crickflix.in';

  // Truncate functions
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  };

  // Format title and descriptions
  const formattedTitle = truncateText(title, TITLE_MAX_LENGTH);
  const formattedDesc = truncateText(description, DESC_MAX_LENGTH);
  const formattedKeywords = truncateText(keywords, KEYWORDS_MAX_LENGTH);

  // Default values
  const defaultTitle = 'CrickFlix - Live Cricket Streaming | Watch Cricket Online Free';
  const defaultDescription = 'Watch live cricket matches online for free at CrickFlix. Stream IPL 2025, World Cup, and international cricket matches in HD quality. Best cricket streaming platform in India.';
  const defaultKeywords = 'cricket streaming, live cricket, watch cricket online, cricket live stream, IPL live streaming, cricket streaming india, live cricket match today, free cricket streaming';
  const defaultImage = `${DOMAIN}/og-image.jpg`;

  // Generate canonical URL
  const currentPath = window.location.pathname;
  const canonicalPath = canonicalUrl || currentPath;
  const fullCanonicalUrl = `${DOMAIN}${canonicalPath}`;

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{formattedTitle || defaultTitle}</title>
        <meta name="title" content={formattedTitle || defaultTitle} />
        <meta name="description" content={formattedDesc || defaultDescription} />
        <meta name="keywords" content={formattedKeywords || defaultKeywords} />

        {/* Language and Region */}
        <meta property="og:locale" content="en_IN" />
        <link rel="alternate" href={fullCanonicalUrl} hrefLang="en-in" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.position" content="20.5937;78.9629" />
        <meta name="ICBM" content="20.5937, 78.9629" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={fullCanonicalUrl} />
        <meta property="og:site_name" content="CrickFlix" />
        <meta property="og:title" content={ogTitle || formattedTitle || defaultTitle} />
        <meta property="og:description" content={ogDescription || formattedDesc || defaultDescription} />
        <meta property="og:image" content={ogImage || defaultImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={fullCanonicalUrl} />
        <meta name="twitter:title" content={ogTitle || formattedTitle || defaultTitle} />
        <meta name="twitter:description" content={ogDescription || formattedDesc || defaultDescription} />
        <meta name="twitter:image" content={ogImage || defaultImage} />

        {/* Mobile Specific */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="CrickFlix" />
        <meta name="application-name" content="CrickFlix" />
        <meta name="theme-color" content="#1A202C" />

        {/* Canonical URL */}
        <link rel="canonical" href={fullCanonicalUrl} />

        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="rating" content="general" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="True" />

        {/* Structured Data */}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": DOMAIN,
              "name": "CrickFlix",
              "description": defaultDescription,
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${DOMAIN}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              },
              ...structuredData
            })}
          </script>
        )}

        {/* Verification Tags */}
        <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />
      </Helmet>

      {/* Hidden H1 for SEO - Only render if hiddenH1 is provided */}
      {hiddenH1 && (
        <Box
          as="h1"
          position="absolute"
          width="1px"
          height="1px"
          padding="0"
          margin="-1px"
          overflow="hidden"
          clip="rect(0, 0, 0, 0)"
          whiteSpace="nowrap"
          borderWidth="0"
          aria-hidden="true"
        >
          {hiddenH1}
        </Box>
      )}
    </>
  );
};

export default SEO; 