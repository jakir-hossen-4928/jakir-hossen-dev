import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, CheckCircle2, Monitor, Smartphone, Tablet, Lock } from 'lucide-react';
import { ProgressiveImg } from '@/components/ProgressiveImg';

const BOOKING_URL = import.meta.env.VITE_MEETTING_URL;

export default function ThemePreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isScrolled, setIsScrolled] = useState(false);
  const [data, setData] = useState<{ themes: any[], categories: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dynamic import
    import('@/assets/design-theme/themes.json').then((module) => {
      setData({
        themes: module.default.portfolio.themes,
        categories: module.default.portfolio.categories,
      });
      setIsLoading(false);
    });
  }, []);

  const theme = useMemo(() => data?.themes.find(t => t.id === id), [id, data]);
  const category = useMemo(() => data?.categories.find(c => c.id === theme?.category), [theme, data]);

  useEffect(() => {
    if (!isLoading) {
      window.scrollTo(0, 0);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

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

  const containerWidths = {
    desktop: 'max-w-full lg:max-w-[1440px]',
    tablet: 'max-w-[768px]',
    mobile: 'max-w-[375px]'
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sticky Top Navigation Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-md border-b border-border py-2.5'
          : 'bg-background border-b border-border/30 py-4'
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
            {/* Device Toggle - Visible on lg+ */}
            <div className="hidden lg:flex items-center p-1 bg-muted rounded-lg border border-border/50">
              <button
                onClick={() => setDeviceView('desktop')}
                className={`p-1.5 rounded-md transition-all ${deviceView === 'desktop' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Desktop View"
              >
                <Monitor size={16} />
              </button>
              <button
                onClick={() => setDeviceView('tablet')}
                className={`p-1.5 rounded-md transition-all ${deviceView === 'tablet' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Tablet View"
              >
                <Tablet size={16} />
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`p-1.5 rounded-md transition-all ${deviceView === 'mobile' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Mobile View"
              >
                <Smartphone size={16} />
              </button>
            </div>

            {/* Action Buttons */}
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

      {/* Main Content Area */}
      <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1920px] mx-auto flex flex-col lg:flex-row gap-8">

        {/* Left Column: Full Page Scrollable Preview */}
        <div className="w-full lg:w-[70%] xl:w-[75%] flex justify-center order-2 lg:order-1">
          <motion.div
            layout
            className={`w-full transition-all duration-500 ease-in-out ${containerWidths[deviceView]}`}
          >
            {/* Browser/Device Chrome Decorator */}
            <div className="bg-card border border-border/50 rounded-t-xl p-2.5 sm:p-3 flex items-center gap-2 shadow-sm relative overflow-hidden">
              {deviceView === 'desktop' && (
                <>
                  <div className="flex gap-1.5 shrink-0 z-10 hidden sm:flex">
                    <div className="w-3 h-3 rounded-full bg-destructive/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="mx-auto px-4 py-1.5 bg-background shadow-sm text-[10px] sm:text-xs text-muted-foreground rounded-lg max-w-md w-full text-center truncate border border-border/50 z-10 flex items-center justify-center gap-2">
                    <Lock size={12} className="text-green-600 dark:text-green-500" />
                    jakirhossen.netlify.app/themes/{theme.id}
                  </div>
                </>
              )}
              {deviceView !== 'desktop' && (
                <div className="w-16 h-1.5 sm:w-20 sm:h-2 bg-muted-foreground/20 rounded-full mx-auto" />
              )}
            </div>

            {/* THE ACTUAL PREVIEW IMAGE */}
            <div className="relative w-full bg-background border-x border-b border-border/50 rounded-b-xl overflow-hidden shadow-2xl shadow-black/5 min-h-[500px]">
              {/* Note: Not setting a fixed height allows the image to stretch its natural height, 
                  and the user relies on normal browser scrolling to view it. 
                  This is best for very long 'go full page' screenshots. */}
              <ProgressiveImg
                src={theme.previewUrl}
                alt={`${theme.name} Full Page Preview`}
                className="w-full h-auto block"
                loading="eager" // Eager since it's the main focus of this page
              />
            </div>
          </motion.div>
        </div>

        {/* Right Column: Theme Details Sticky Sidebar */}
        <div className="w-full lg:w-[30%] xl:w-[25%] order-1 lg:order-2">
          <div className="sticky top-[100px] md:top-[120px] bg-card border border-border/50 rounded-2xl p-5 sm:p-6 shadow-sm shadow-black/5 flex flex-col gap-6">

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                {category?.name || theme.category}
              </div>
              <h2 className="text-2xl font-black text-foreground mb-2">{theme.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {theme.description}
              </p>
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
    </div>
  );
}
