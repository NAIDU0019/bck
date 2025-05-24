import { Helmet } from "react-helmet";

interface HeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  children?: React.ReactNode;
}

const Head = ({
  title = "ADHYAA PICKLES - Premium Handcrafted Pickles",
  description = "ADHYAA PICKLES - Premium quality vegetarian and non-vegetarian pickles made with authentic recipes.",
  keywords = "adhyaa pickles, homemade pickles, vegetarian pickles, non-vegetarian pickles, Indian pickles",
  image = "https://adhyaapickles.com/logo.png", // Change to actual logo URL
  url = "https://adhyaapickles.com",
  children,
}: HeadProps) => {
  return (
    <Helmet>
      {/* Basic Meta */}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="author" content="ADHYAA PICKLES" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@adhyaapickles" />

      {children}
    </Helmet>
  );
};

export default Head;
