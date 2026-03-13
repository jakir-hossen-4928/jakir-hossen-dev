import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProgressiveImg } from '@/components/ProgressiveImg';

// We dynamically load the JSON to avoid blocking the main bundle,
// but for simplicity in a statically exported app, we can just use an async generic loader pattern.
// In this case, since it's a large JSON, we'll simulate a dynamic import to avoid initial load stutter.
type ThemeData = {
  portfolio: any;
  categories: any[];
  themes: any[];
};

export default function ThemesGallery() {
  const [data, setData] = useState<ThemeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Instead of a direct dynamic import which can still cause a slight freeze while parsing a huge JSON,
    // we use a small timeout to allow the browser to paint the loading spinner first.
    const loadData = async () => {
      try {
        const module = await import('@/assets/design-theme/themes.json');
        // Yield to the main thread
        await new Promise(resolve => setTimeout(resolve, 50));
        
        setData({
          portfolio: module.default.portfolio,
          categories: module.default.portfolio.categories,
          themes: module.default.portfolio.themes,
        });
      } catch (error) {
        console.error("Failed to load themes data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Defer the execution to let the component mount and show the spinner
    setTimeout(loadData, 0);
  }, []);

  const filteredThemes = useMemo(() => {
    if (!data) return [];
    return data.themes.filter((theme) => {
      const matchesCategory = activeCategory === 'all' || theme.category === activeCategory;
      const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            theme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            theme.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, data]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium animate-pulse">Loading Web Themes Portfolio...</p>
      </div>
    );
  }

  const { portfolio, categories } = data;

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="section-container">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black tracking-tight mb-6"
          >
            {portfolio.metadata.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            {portfolio.metadata.description}
          </motion.p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === 'all' 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground'
              }`}
            >
              All Themes
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border/50 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredThemes.map((theme) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={theme.id}
                className="group flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-1"
                style={{ contentVisibility: 'auto', containIntrinsicSize: '400px' }}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <ProgressiveImg 
                    src={theme.imageUrl} 
                    alt={theme.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Hover Actions */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center z-10">
                    <Link 
                      to={`/themes/${theme.id}`}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                      Preview <ExternalLink size={16} />
                    </Link>
                    <span className="px-3 py-1 bg-background/90 backdrop-blur-sm text-foreground rounded-full text-xs font-bold">
                      {theme.pricing.currency} {theme.pricing.basePrice}
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {categories.find(c => c.id === theme.category)?.name}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      Complexity: <span className="capitalize text-foreground font-medium">{theme.complexity}</span>
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-black mb-2 text-foreground group-hover:text-primary transition-colors">
                    <Link to={`/themes/${theme.id}`} className="focus:outline-none">
                      {theme.name}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {theme.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {theme.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-muted rounded-md text-[10px] font-medium text-muted-foreground mix-blend-multiply dark:mix-blend-screen">
                        #{tag}
                      </span>
                    ))}
                    {theme.tags.length > 3 && (
                      <span className="px-2 py-1 bg-muted rounded-md text-[10px] font-medium text-muted-foreground">
                        +{theme.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredThemes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground font-medium">No themes found matching your criteria.</p>
            <button 
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="mt-4 text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
