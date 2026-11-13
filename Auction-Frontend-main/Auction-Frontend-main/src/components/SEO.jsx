import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = "Rule7Media | Vehicle Wrapping Leads & Car Wrap Marketing Agency";
const DEFAULT_DESCRIPTION = "Rule7Media provides high-converting vehicle wrapping leads, first-mover franchise opportunities, and fleet car wrap marketing solutions.";
const DEFAULT_KEYWORDS = "Vehicle wrapping leads, Car wrap marketing agency, Wrapping business leads, First-mover advantage wrapping, Rule7Media franchise";
const DEFAULT_IMAGE = "https://www.rule7media.com/favicon.png";
const BASE_URL = "https://www.rule7media.com";

const SEO = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  publishedTime,
  modifiedTime,
  schema,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  twitterCard = "summary_large_image",
}) => {
  const location = useLocation();
  const rawPath = location ? location.pathname : "";
  const currentUrl = canonicalUrl || `${BASE_URL}${rawPath === "/" ? "" : rawPath}`;
  const finalTitle = title || DEFAULT_TITLE;
  const finalDesc = description || DEFAULT_DESCRIPTION;
  const finalKeywords = keywords || DEFAULT_KEYWORDS;
  const finalImage = ogImage || DEFAULT_IMAGE;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph - Facebook / LinkedIn */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Rule7Media" />
      <meta property="og:image" content={finalImage} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={finalImage} />

      {/* Robots */}
      <meta name="robots" content="index, follow" />

      {/* Schema Markup */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
};

export default SEO;

