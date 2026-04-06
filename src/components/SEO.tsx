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

const defaultKeywords = "Jakir Hossen, Frontend Developer, Shopify Store Designer, Shopify Store Builder, Portfolio Builder, React, Supabase, Firebase, Expo App, Landing Page Designer, TypeScript, Web Developer Bangladesh, Shopify Expert, E-commerce Developer";

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
  const siteUrl = "http://jakirhossen.xyz";
  const fullTitle = `${title} | Jakir Hossen`;
  const fullOgUrl = ogUrl ? `${siteUrl}${ogUrl}` : `${siteUrl}/`;
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
    title: "Jakir Hossen | Shopify Store Designer & Builder",
    description: "Jakir Hossen - Professional Shopify Store Designer, Builder & Portfolio Expert. Specializing in high-performance web solutions using React, Supabase, Firebase, and Expo Apps.",
    ogUrl: "/",
  },
  themes: {
    title: "Premium Web Themes & Portfolio Templates",
    description: "Explore premium web themes, portfolio templates, and landing page designs. Custom Shopify themes and React applications built with React & Supabase.",
    ogUrl: "/themes",
  },
  blogs: {
    title: "Development Blog | React & Shopify Insights",
    description: "Insights on frontend development, Shopify store building, portfolio creation, React, Supabase, and Expo app development.",
    ogUrl: "/blogs",
  },
  apps: {
    title: "Mobile Apps | React Native & Expo",
    description: "Official Android apps developed with Expo and React Native by Jakir Hossen. High-performance mobile solutions.",
    ogUrl: "/apps",
  },
  contact: {
    title: "Get In Touch | Project Inquiry",
    description: "Contact Jakir Hossen for web development, Shopify store building, portfolio creation, and custom software using Firebase & Supabase.",
    ogUrl: "/contact",
  },
  admin: {
    title: "Admin Dashboard",
    description: "Admin dashboard for managing portfolio content.",
    noIndex: true,
  },
};

