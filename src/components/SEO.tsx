import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  noIndex?: boolean;
}

const defaultKeywords = "Jakir Hossen, Frontend Developer, Shopify Developer, Landing Page Designer, Portfolio Designer, React Developer, TypeScript, Firebase, Web Developer Bangladesh, Shopify Expert, E-commerce Developer";

export function SEO({
  title,
  description,
  keywords = defaultKeywords,
  ogTitle,
  ogDescription,
  ogImage = "/jakir-hossen.jpg",
  ogUrl,
  canonical,
  noIndex = false,
}: SEOProps) {
  const siteUrl = "https://jakirhossen.netlify.app";
  const fullTitle = `${title} | Jakir Hossen`;
  const fullOgUrl = ogUrl ? `${siteUrl}${ogUrl}` : siteUrl;
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : fullOgUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonical} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullOgUrl} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="Jakir Hossen Portfolio" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullOgUrl} />
      <meta property="twitter:title" content={ogTitle || fullTitle} />
      <meta property="twitter:description" content={ogDescription || description} />
      <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Additional SEO */}
      <meta name="author" content="Jakir Hossen" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
    </Helmet>
  );
}

// Predefined SEO configurations for common pages
export const seoConfig = {
  home: {
    title: "Frontend, Shopify & Landing Page Designer",
    description: "Jakir Hossen - Expert Frontend Developer, Shopify Developer & Landing Page Designer specializing in React, TypeScript, Firebase, portfolio design, and high-performance e-commerce solutions.",
    ogUrl: "/",
  },
  themes: {
    title: "Premium Web Themes & Portfolio Templates",
    description: "Explore premium web themes, portfolio templates, and landing page designs for modern businesses. Custom Shopify themes and React applications.",
    ogUrl: "/themes",
  },
  blogs: {
    title: "Development Blog",
    description: "Insights on frontend development, Shopify customization, landing page design, portfolio creation, React best practices, and modern web technologies.",
    ogUrl: "/blogs",
  },
  apps: {
    title: "Mobile Apps",
    description: "Official Android apps developed by Jakir Hossen. Download mobile applications for productivity and lifestyle.",
    ogUrl: "/apps",
  },
  contact: {
    title: "Get In Touch",
    description: "Contact Jakir Hossen for web development projects, Shopify store design, landing page creation, portfolio design, and frontend consulting services.",
    ogUrl: "/contact",
  },
  admin: {
    title: "Admin Dashboard",
    description: "Admin dashboard for managing portfolio content.",
    noIndex: true,
  },
};
