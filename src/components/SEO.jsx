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
  const defaultTitle = 'CrickFlix - Live Cricket Streaming';
  const defaultDescription = 'Watch live cricket matches online for free. Stream IPL, World Cup, and international cricket matches in HD quality.';
  const defaultKeywords = 'cricket streaming, live cricket, watch cricket online, cricket live stream, IPL live';

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{formattedTitle || defaultTitle}</title>
        <meta name="title" content={formattedTitle || defaultTitle} />
        <meta name="description" content={formattedDesc || defaultDescription} />
        <meta name="keywords" content={formattedKeywords || defaultKeywords} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl || window.location.href} />
        <meta property="og:title" content={ogTitle || formattedTitle || defaultTitle} />
        <meta property="og:description" content={ogDescription || formattedDesc || defaultDescription} />
        {ogImage && <meta property="og:image" content={ogImage} />}

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl || window.location.href} />
        <meta property="twitter:title" content={ogTitle || formattedTitle || defaultTitle} />
        <meta property="twitter:description" content={ogDescription || formattedDesc || defaultDescription} />
        {ogImage && <meta property="twitter:image" content={ogImage} />}

        {/* Canonical URL */}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

        {/* Structured Data */}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
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