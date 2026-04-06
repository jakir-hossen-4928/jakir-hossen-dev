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
  structuredData?: Record<string, any>;
}

const defaultKeywords = "Jakir Hossen, Jakir, Shopify Store Designer, Shopify Store Builder, Shopify Expert, React Developer, Portfolio Designer, Landing Page Designer, Web Developer Bangladesh, Frontend Developer, TypeScript Developer, Firebase Developer, E-commerce Developer, Shopify Theme Developer, React Portfolio, Landing Page Design, Website Designer, UI/UX Designer Bangladesh, Shopify Customization, React Web App, Progressive Web App, Mobile App Developer, Jakir Hossen Portfolio, Jakir Developer";

export function SEO({
  title,
  description,
  keywords = defaultKeywords,
  ogTitle,
  ogDescription,
  ogImage = "/og-image.png",
  ogUrl,
  canonical,
  noIndex = false,
  structuredData,
}: SEOProps) {
  const siteUrl = "https://jakirhossen.xyz";
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
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullOgUrl} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Jakir Hossen - Shopify Store Designer & React Developer" />
      <meta property="og:site_name" content="Jakir Hossen Portfolio" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullOgUrl} />
      <meta property="twitter:title" content={ogTitle || fullTitle} />
      <meta property="twitter:description" content={ogDescription || description} />
      <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />
      <meta property="twitter:image:alt" content="Jakir Hossen Portfolio" />

      {/* Additional SEO */}
      <meta name="author" content="Jakir Hossen" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="3 days" />
      <meta name="rating" content="general" />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Predefined SEO configurations for common pages
export const seoConfig = {
  home: {
    title: "Jakir Hossen | Shopify Store Designer & Builder | React Developer",
    description: "Jakir Hossen - Award-winning Shopify Store Designer, React Developer & Portfolio Expert. 25+ high-converting e-commerce stores, portfolios & landing pages delivered. Expert in React, TypeScript, Firebase & Shopify customization.",
    ogUrl: "/",
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "@id": "https://jakirhossen.xyz/#person",
          name: "Jakir Hossen",
          alternateName: ["Jakir", "Jakir Hossen Developer"],
          url: "https://jakirhossen.xyz",
          image: "https://jakirhossen.xyz/jakir-hossen.jpg",
          jobTitle: "Shopify Store Designer & Builder | React Developer | Portfolio Expert",
          description: "Award-winning frontend developer specializing in Shopify store design, React web applications, portfolio creation, and landing page design",
          worksFor: {
            "@type": "Organization",
            name: "Softvance Delta"
          },
          sameAs: [
            "https://github.com/jakir-hossen-4928",
            "https://www.linkedin.com/in/jakir-hossen-36b26b244/",
            "https://play.google.com/store/apps/dev?id=6495908705399463745"
          ],
          alumniOf: [
            {
              "@type": "EducationalOrganization",
              name: "Feni Computer Institute",
              description: "Computer Science & Technology (2022-2026)"
            },
            {
              "@type": "EducationalOrganization",
              name: "Ibn Taimiya School & College",
              description: "Secondary Education (2016-2021)"
            }
          ],
          knowsAbout: [
            "Shopify Store Design",
            "Shopify Store Building",
            "React Development",
            "TypeScript",
            "Portfolio Design",
            "Landing Page Design",
            "Frontend Development",
            "E-commerce Solutions",
            "Firebase",
            "Supabase",
            "UI/UX Design",
            "Web Application Development"
          ]
        },
        {
          "@type": "WebSite",
          "@id": "https://jakirhossen.xyz/#website",
          url: "https://jakirhossen.xyz",
          name: "Jakir Hossen - Shopify Store Designer & React Developer Portfolio",
          alternateName: ["Jakir Hossen Portfolio", "Jakir Developer Portfolio"],
          description: "Professional portfolio showcasing Shopify store design, React development, portfolio creation, and landing page design services",
          publisher: {
            "@id": "https://jakirhossen.xyz/#person"
          },
          inLanguage: "en-US"
        },
        {
          "@type": "ProfessionalService",
          "@id": "https://jakirhossen.xyz/#service",
          name: "Jakir Hossen - Web Development Services",
          image: "https://jakirhossen.xyz/og-image.png",
          description: "Professional Shopify store design, React web development, portfolio creation, and landing page design services",
          url: "https://jakirhossen.xyz/",
          email: "mdjakirkhan4928@gmail.com",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Dhaka",
            addressCountry: "BD"
          },
          priceRange: "$$",
          areaServed: {
            "@type": "Country",
            name: "Bangladesh"
          },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Web Development Services",
            itemListElement: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Shopify Store Design & Development"
                }
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "React Web Application Development"
                }
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Portfolio Website Design"
                }
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Landing Page Design & Development"
                }
              }
            ]
          }
        },
        {
          "@type": "ItemList",
          name: "Work Experience",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              item: {
                "@type": "Organization",
                name: "Softvance Delta",
                description: "Frontend Developer - Leading frontend development and crafting high-converting Shopify store designs",
                startDate: "2026-02",
                endDate: "Present",
                location: {
                  "@type": "Place",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Dhaka",
                    addressCountry: "BD"
                  }
                }
              }
            },
            {
              "@type": "ListItem",
              position: 2,
              item: {
                "@type": "Organization",
                name: "MySchool",
                description: "Accountant - Managing administrative tasks, staff training, and leading digital transformation initiatives",
                startDate: "2024-12",
                endDate: "2025-08",
                location: {
                  "@type": "Place",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Cheora, Cumilla",
                    addressCountry: "BD"
                  }
                }
              }
            }
          ]
        },
        {
          "@type": "ItemList",
          name: "Education",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              item: {
                "@type": "EducationalOrganization",
                name: "Feni Computer Institute",
                description: "Computer Science & Technology - Deepening technical knowledge and engineering principles",
                startDate: "2022",
                endDate: "2026",
                location: {
                  "@type": "Place",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Ranir Hat, Feni",
                    addressCountry: "BD"
                  }
                }
              }
            },
            {
              "@type": "ListItem",
              position: 2,
              item: {
                "@type": "EducationalOrganization",
                name: "Ibn Taimiya School & College",
                description: "Secondary School Certificate - Strong foundational education through academic excellence",
                startDate: "2016",
                endDate: "2021",
                location: {
                  "@type": "Place",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Tomsom Bridge, Cumilla",
                    addressCountry: "BD"
                  }
                }
              }
            }
          ]
        }
      ]
    }
  },
  themes: {
    title: "Premium Web Themes & Portfolio Templates | Jakir Hossen",
    description: "Explore premium web themes, portfolio templates, and landing page designs by Jakir Hossen. Custom Shopify themes and React applications built with modern technologies.",
    ogUrl: "/themes",
  },
  blogs: {
    title: "Development Blog | React & Shopify Insights | Jakir Hossen",
    description: "Expert insights on frontend development, Shopify store building, portfolio creation, React, and web development by Jakir Hossen.",
    ogUrl: "/blogs",
  },
  apps: {
    title: "Mobile Apps | React Native & Expo | Jakir Hossen",
    description: "Official Android apps developed with Expo and React Native by Jakir Hossen. High-performance mobile solutions.",
    ogUrl: "/apps",
  },
  contact: {
    title: "Get In Touch | Project Inquiry | Jakir Hossen",
    description: "Contact Jakir Hossen for Shopify store design, React development, portfolio creation, and landing page design services.",
    ogUrl: "/contact",
  },
  admin: {
    title: "Admin Dashboard",
    description: "Admin dashboard for managing portfolio content.",
    noIndex: true,
  },
};
