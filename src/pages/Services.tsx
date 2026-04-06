import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Check,
  ArrowRight,
  Code2,
  ShoppingBag,
  Palette,
  Globe,
  ShieldCheck,
  Zap,
  MessageSquare,
  Layout,
  Bot,
  Laptop,
  Server,
  Monitor,
  Rocket,
  Search,
  FormInput,
  Layers,
  Smartphone
} from "lucide-react";
import { Link } from "react-router-dom";

const realServices = [
  {
    id: "portfolio",
    title: "Portfolio Website",
    description: "Showcase your work with a stunning portfolio website. Designed for creatives and professionals who need to present their achievements in the best possible light.",
    price: { usd: 120, gbp: 100 },
    timeline: "5-10 days",
    features: [
      "Interactive project galleries",
      "Case study detail pages",
      "Skills and experience timeline",
      "Contact form and social links",
      "Resume/CV download",
      "Optimized image galleries"
    ],
    icon: Code2,
    featured: true
  },
  {
    id: "shopify-build",
    title: "Shopify Store Build",
    description: "Complete Shopify store setup tailored for real business growth—not just design, but structure that sells.",
    price: { usd: 220, gbp: 180 },
    timeline: "7-14 days",
    features: [
      "Full store setup from scratch",
      "Payment gateway integration",
      "Product & collection structure",
      "Essential apps setup",
      "Theme customization",
      "Mobile optimized layout"
    ],
    icon: ShoppingBag,
    featured: true
  },
  {
    id: "mobile-ecommerce",
    title: "E-commerce Mobile App",
    description: "High-performance iOS & Android e-commerce application built with React Native and Expo. Seamlessly integrated with Supabase for backend and Sanity for content management.",
    price: { usd: 400, gbp: 320 },
    timeline: "14-21 days",
    features: [
      "Cross-platform (iOS & Android)",
      "Supabase Backend & Auth",
      "Sanity CMS for product data",
      "Real-time notifications",
      "Secure payment integration",
      "Optimized for Expo & App Store"
    ],
    icon: Smartphone,
    featured: true
  },
  {
    id: "dropshipping",
    title: "Dropshipping Store",
    description: "Launch-ready dropshipping store with product research structure and high-converting pages.",
    price: { usd: 220, gbp: 180 },
    timeline: "7-14 days",
    features: [
      "Winning product structure",
      "Supplier integration",
      "Product import & optimization",
      "Landing page design",
      "Order flow setup",
      "Marketing tools ready"
    ],
    icon: Globe,
    featured: false
  },
  {
    id: "shopify-design",
    title: "Shopify UI/UX Design",
    description: "Conversion-focused redesign to improve user experience and increase sales.",
    price: { usd: 120, gbp: 100 },
    timeline: "3-5 days",
    features: [
      "Premium layout redesign",
      "Brand colors & visual identity",
      "User journey optimization",
      "High-quality product visuals",
      "Custom sections",
      "Conversion-focused tweaks"
    ],
    icon: Palette,
    featured: false
  },
  {
    id: "automation",
    title: "Business Automation (n8n + Telegram)",
    description: "Automate your business workflows to save time, capture leads, and respond instantly.",
    price: { usd: 100, gbp: 80 },
    timeline: "3-7 days",
    features: [
      "Telegram bot automation",
      "Lead capture & auto-response system",
      "Google Sheets as database",
      "Form → CRM automation",
      "Notification system (instant alerts)",
      "Custom workflows using n8n"
    ],
    icon: Bot,
    featured: false
  },
  {
    id: "single-page",
    title: "Single Page Website",
    description: "Clean, high-converting landing page designed to capture attention and turn visitors into leads or customers.",
    price: { usd: 200, gbp: 160 },
    timeline: "5-10 days",
    features: [
      "Responsive design with React & Tailwind CSS",
      "Modern animations using Framer Motion",
      "Contact form with email integration",
      "SEO optimization and meta tags",
      "Fast loading with Next.js optimization",
      "Mobile-first responsive design"
    ],
    icon: Layout,
    featured: true
  }
];

const includedFeatures = [
  { title: "Responsive Design", icon: Monitor, color: "text-blue-500" },
  { title: "Smooth Animations", icon: Rocket, color: "text-purple-500" },
  { title: "Contact Form", icon: FormInput, color: "text-green-500" },
  { title: "Fast Performance", icon: Zap, color: "text-yellow-500" },
  { title: "SEO Basics", icon: Search, color: "text-red-500" }
];

const techStack = [
  {
    name: "Frontend",
    tool: "React + Vite",
    desc: "Lightweight and ultra-fast for static content. Alternatives: Tailwind, Next.js.",
    icon: Laptop
  },
  {
    name: "E-commerce",
    tool: "Shopify Storefront",
    desc: "Top-tier e-commerce solution for global scaling. Includes Liquid & Hydrogen support.",
    icon: ShoppingBag
  },
  {
    name: "Styling",
    tool: "Tailwind CSS",
    desc: "Utility-first CSS for custom, responsive designs. Alternatives: Styled Components, SASS.",
    icon: Layers
  },
  {
    name: "Deployment",
    tool: "Vercel / Netlify",
    desc: "Global CDN hosting for instant page loads. Alternatives: AWS S3, GitHub Pages.",
    icon: Server
  },
  {
    name: "Mobile",
    tool: "React Native + Expo",
    desc: "Cross-platform mobile apps with Supabase backend and Sanity CMS. Alternatives: Flutter, Swift.",
    icon: Smartphone
  }
];

const Services = () => {
  const [useGbp, setUseGbp] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO 
        title="Web Development Services | Shopify, React, Portfolio & Landing Pages" 
        description="Professional Shopify store design, React web development, portfolio creation, and landing page design services by Jakir Hossen. High-quality, affordable web solutions."
        keywords="Shopify Store Design Service, React Development Service, Portfolio Website Design, Landing Page Design, Web Developer Services, E-commerce Development, Frontend Development Service, Jakir Hossen Services"
      />
      <Header />

      <main className="pt-32 pb-20">
        <div className="section-container">
          {/* Hero Header */}
          <div className="max-w-3xl mx-auto mb-16 text-center space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                My Service Catalog
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tightest leading-none"
            >
              Real <span className="text-primary italic border-b-4 border-primary/20 pb-2">Solutions.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg font-medium leading-relaxed max-w-2xl mx-auto"
            >
              Tailored development for businesses who demand speed, design, and growth. Choose your project type below.
            </motion.p>

            {/* Currency Switcher */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-bold transition-colors ${!useGbp ? 'text-primary' : 'text-muted-foreground'}`}>USD ($)</span>
              <Switch checked={useGbp} onCheckedChange={setUseGbp} className="data-[state=checked]:bg-primary" />
              <span className={`text-sm font-bold transition-colors ${useGbp ? 'text-primary' : 'text-muted-foreground'}`}>GBP (£)</span>
            </motion.div>
          </div>

          {/* Services Grid */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {realServices.map((service) => (
              <motion.div key={service.id} variants={itemVariants}>
                <Card className={`group relative h-full bg-card border-border/50 hover:border-primary/50 transition-all duration-500 flex flex-col p-8 overflow-hidden ${service.featured ? 'border-primary/40 shadow-xl shadow-primary/5' : ''}`}>
                  {service.featured && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest px-4 py-1.5">
                        Recommended
                      </div>
                    </div>
                  )}

                  <div className="mb-6 shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm shadow-primary/5">
                      <service.icon size={22} />
                    </div>
                  </div>

                  <h3 className="text-xl font-black mb-3 text-foreground tracking-tight">{service.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium mb-6 leading-relaxed flex-grow">
                    {service.description}
                  </p>

                  <div className="space-y-4 mb-8 shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-foreground">
                        {useGbp ? `£${service.price.gbp}` : `$${service.price.usd}`}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Starting</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
                      <Zap size={10} />
                      {service.timeline}
                    </div>
                  </div>

                  <div className="space-y-3 mb-8 text-left border-t border-border/50 pt-6 shrink-0">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check size={14} className="text-primary shrink-0 mt-0.5" />
                        <span className="text-[11px] font-bold text-foreground leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button asChild className={`w-full font-black uppercase tracking-widest transition-all h-12 rounded-xl active:scale-95 ${service.featured ? 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20' : 'bg-muted text-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/10'}`}>
                    <a
                      href={`https://wa.me/8801864091946?text=${encodeURIComponent(
                        `Hello Jakir! \n\nI'm interested in your *${service.title}* service.\n\nProject: ${service.title}\nStarting at: ${useGbp ? `£${service.price.gbp}` : `$${service.price.usd}`}\nEstimated Timeline: ${service.timeline}\n\nI'd like to discuss the details with you. Please let me know when you're available!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      Get Started
                      <ArrowRight size={16} />
                    </a>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Standard Included Features */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-32 text-center border-y border-border/30 py-16 bg-muted/20 rounded-3xl">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-12">Standard with every project</h2>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {includedFeatures.map((feat) => (
                <div key={feat.title} className="flex flex-col items-center gap-4 group">
                  <div className={`p-5 rounded-2xl bg-background border border-border/50 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${feat.color}`}>
                    <feat.icon size={28} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{feat.title}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tech Stack Section */}
          <div className="mt-40">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-6xl font-black tracking-tightest mb-6">
                The modern <span className="text-primary italic underline decoration-primary/20 underline-offset-8">tech stack</span> I use.
              </h2>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                I leverage the most powerful and lightweight tools in 2025 to ensure your website is not just a bunch of code, but a high-performance engine for your business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {techStack.map((tech) => (
                <div key={tech.name} className="flex flex-col gap-6 p-8 rounded-3xl bg-muted/20 border border-border/30 hover:border-primary/40 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <tech.icon size={80} />
                  </div>
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-background border border-border/50 shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                    <tech.icon size={22} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-foreground mb-2 flex items-center gap-2">
                      {tech.name} <span className="w-1 h-1 rounded-full bg-primary/40" />
                    </h4>
                    <span className="text-lg font-black text-primary italic mb-2 block">{tech.tool}</span>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{tech.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Centered Guarantee Card */}
            <div className="max-w-3xl mx-auto">
              <div className="relative aspect-auto rounded-[2rem] overflow-hidden bg-card border border-primary/20 p-10 sm:p-16 shadow-2xl shadow-primary/5 group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                <div className="relative text-center space-y-8">
                  <div className="inline-flex p-5 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 animate-pulse group-hover:animate-none transition-all duration-500 group-hover:scale-110">
                    <ShieldCheck size={48} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Launch Ready Guarantee</h3>
                    <p className="text-sm md:text-base text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                      Every site I build passes Lighthouse performance tests, accessibility audits, and is ready for production scaling from day one. I don't just deliver files; I deliver a business asset.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6 pt-4">
                    {['Performance', 'SEO Ready', 'Security', 'Scaling'].map((tag) => (
                      <div key={tag} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                        <Check size={12} />
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
