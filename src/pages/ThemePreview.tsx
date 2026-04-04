import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, CheckCircle2, Monitor, Smartphone, Tablet, Lock } from 'lucide-react';
import { ProgressiveImg } from '@/components/ProgressiveImg';
import { FloatingWhatsApp } from '@digicroz/react-floating-whatsapp';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useWebThemeById, useThemeCategories } from '@/hooks/useWebThemes';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';

const BOOKING_URL = import.meta.env.VITE_MEETTING_URL;

// Device widths configuration
const DEVICE_WIDTHS = {
  desktop: 'max-w-full lg:max-w-[1440px]',
  tablet: 'max-w-[768px]',
  mobile: 'max-w-[375px]'
} as const;

type DeviceView = 'desktop' | 'tablet' | 'mobile';

export default function ThemePreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  const [isScrolled, setIsScrolled] = useState(false);

  // Use optimized hook with O(1) Map lookup instead of O(n) find
  const { theme, isLoading: themeLoading } = useWebThemeById(id);
  const { categories, isLoading: categoriesLoading } = useThemeCategories();

  // Memoize category lookup with Map for O(1) access
  const category = useMemo(() => {
    if (!theme) return undefined;
    return categories.find(c => c.id === theme.category || c.name === theme.category);
  }, [theme, categories]);

  const isLoading = themeLoading || categoriesLoading;

  usePageTitle(theme ? `${theme.name} Preview` : 'Theme Preview');

  // Memoized scroll handler
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      window.scrollTo(0, 0);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, handleScroll]);

  // Memoized device view setter
  const setDeviceViewCallback = useCallback((view: DeviceView) => {
    setDeviceView(view);
  }, []);

  // Memoized derived values
  const containerWidthClass = useMemo(() => DEVICE_WIDTHS[deviceView], [deviceView]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium animate-pulse">Loading Preview Details...</p>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-4xl font-black mb-4">Theme Not Found</h1>
        <p className="text-muted-foreground mb-8">The theme you are looking for does not exist or has been removed.</p>
        <Link to="/themes" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-colors">
          Browse All Themes
        </Link>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-muted/20">
      <SEO title={`${theme.name} - Theme Preview`} description={theme.tagline} />
      <Header />

      {/* Sticky Theme Toolbar Below Header */}
      <div
        className={`fixed top-16 md:top-20 left-0 right-0 z-40 transition-all duration-300 ${isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-md border-b border-border py-2'
          : 'bg-background border-b border-border/30 py-3'
          }`}
      >
        <div className="section-container flex items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate('/themes')}
              className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors shrink-0"
              aria-label="Back to themes"
            >
              <ArrowLeft size={18} className="text-foreground sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0 flex flex-col">
              <h1 className="text-sm sm:text-lg md:text-xl font-black text-foreground truncate leading-tight">{theme.name}</h1>
              <p className="hidden sm:block text-xs text-muted-foreground truncate">{theme.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Device Toggle */}
            <div className="hidden lg:flex items-center p-1 bg-muted rounded-lg border border-border/50">
              <button
                onClick={() => setDeviceViewCallback('desktop')}
                className={`p-1.5 rounded-md transition-all ${deviceView === 'desktop' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Desktop View"
              >
                <Monitor size={16} />
              </button>
              <button
                onClick={() => setDeviceViewCallback('tablet')}
                className={`p-1.5 rounded-md transition-all ${deviceView === 'tablet' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Tablet View"
              >
                <Tablet size={16} />
              </button>
              <button
                onClick={() => setDeviceViewCallback('mobile')}
                className={`p-1.5 rounded-md transition-all ${deviceView === 'mobile' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Mobile View"
              >
                <Smartphone size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex px-3 py-1 bg-muted rounded-md text-sm font-bold border border-border/50">
                {theme.pricing.currency} {theme.pricing.basePrice}
              </span>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 sm:px-6 py-1.5 sm:py-2 bg-primary text-primary-foreground text-xs sm:text-sm font-bold rounded-full hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95 whitespace-nowrap"
              >
                <Calendar size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Book to Order</span>
                <span className="sm:hidden">Order</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Corrected padding to account for dynamic Header + Toolbar height */}
      <div className="pt-[140px] md:pt-[160px] pb-20 px-4 md:px-8 max-w-[1920px] mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left Column: Device Perspective Preview */}
        <div className="w-full lg:w-[70%] xl:w-[75%] flex justify-center order-2 lg:order-1">
          <motion.div
            layout
            className={`w-full transition-all duration-500 ease-in-out ${containerWidthClass}`}
          >
            <div className="relative bg-background border border-border pb-1 rounded-2xl overflow-hidden shadow-2xl shadow-primary/5 flex flex-col h-[70vh] sm:h-[75vh] lg:h-[80vh]">
              {/* STICKY Browser Header */}
              <div className="sticky top-0 left-0 right-0 z-20 bg-card/95 backdrop-blur-md border-b border-border/50 p-2.5 sm:p-3 flex items-center gap-2 shadow-sm shrink-0">
                {deviceView === 'desktop' && (
                  <>
                    <div className="flex gap-1.5 shrink-0 z-10 hidden sm:flex">
                      <div className="w-3 h-3 rounded-full bg-destructive/60 hover:bg-destructive transition-colors shrink-0" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60 hover:bg-yellow-500 transition-colors shrink-0" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60 hover:bg-green-500 transition-colors shrink-0" />
                    </div>
                    <div className="mx-auto px-4 py-1 bg-muted/50 text-[10px] sm:text-xs text-muted-foreground rounded-full max-w-sm w-full text-center truncate border border-border/50 z-10 flex items-center justify-center gap-2">
                      <Lock size={12} className="text-green-600 dark:text-green-400 shrink-0" />
                      <span className="truncate">jakirhossen.dev/themes/{theme.id}</span>
                    </div>
                  </>
                )}
                {deviceView !== 'desktop' && (
                  <div className="w-16 h-1.5 sm:w-20 sm:h-2 bg-muted-foreground/20 rounded-full mx-auto" />
                )}
              </div>

              <div className="flex-grow overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 transition-colors">
                <div className="w-full relative">
                  <ProgressiveImg
                    src={theme.previewUrl}
                    alt={`${theme.name} Full Page Preview`}
                    className="w-full h-auto block"
                    loading="eager"
                  />
                  {deviceView === 'mobile' && (
                    <div className="sticky bottom-2 mx-auto w-24 h-1 bg-foreground/20 rounded-full z-10 hidden sm:block" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center px-2">
              <div className="text-[10px] sm:text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">
                Interactive Preview Mode
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-primary/60">
                Scroll to explore full details
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Theme Details Sidebar */}
        <div className="w-full lg:w-[30%] xl:w-[25%] order-1 lg:order-2">
          <div className="sticky top-[160px] md:top-[180px] bg-card border border-border/50 rounded-2xl p-5 sm:p-6 shadow-sm shadow-black/5 flex flex-col gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                {category?.name || theme.category}
              </div>
              <h2 className="text-2xl font-black text-foreground mb-2">{theme.name}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: theme.description }}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Highlighted Features</h3>
              <ul className="flex flex-col gap-2">
                {theme.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Best Suited For</h3>
              <div className="flex flex-wrap gap-1.5">
                {theme.bestFor.map((item, i) => (
                  <span key={i} className="px-2.5 py-1 bg-muted/50 border border-border/50 rounded-md text-xs text-muted-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Complexity</span>
                <span className="font-bold capitalize text-foreground">{theme.complexity}</span>
              </div>
              {theme.meetingBooking.requiresDeposit && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Initial Deposit</span>
                  <span className="font-bold text-foreground">${theme.meetingBooking.depositAmount}</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col gap-3 mt-auto">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center px-4 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <Calendar size={18} />
                Book Consultation
              </a>
              <p className="text-[10px] text-center text-muted-foreground">
                Typically a {theme.meetingBooking.duration}-minute consultation to discuss your specific needs.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {/* WhatsApp Floating Button */}
      <FloatingWhatsApp
        phoneNumber="8801864091946"
        accountName="Jakir Hossen"
        avatar="/jakir-hossen.jpg"
        statusMessage="Typically replies within 1 hour"
        chatMessage={`Hello! 👋\nInterested in the *${theme.name}* theme?\nHow can I help you today?`}
        placeholder="Type a message..."
        darkMode={false}
        allowClickAway={true}
        allowEsc={true}
        notification={true}
        notificationDelay={30}
        notificationSound={true}
      />
    </div>
  );
}
