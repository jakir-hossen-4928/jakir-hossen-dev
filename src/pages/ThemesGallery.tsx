import { useState, useMemo, useDeferredValue, memo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ProgressiveImg } from '@/components/ProgressiveImg';
import { useWebThemes, useThemeCategories, useFilteredThemes } from '@/hooks/useWebThemes';
import { WebTheme, ThemeCategory } from '@/lib/types';
import { SEO, seoConfig } from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Memoized ThemeCard with optimized re-render prevention
const ThemeCard = memo(({ theme, categoryName }: { theme: WebTheme; categoryName: string }) => {
  // Memoize truncated description to prevent recalculation
  const truncatedDesc = useMemo(() => {
    const maxLen = 150;
    return theme.description.length > maxLen 
      ? theme.description.substring(0, maxLen) + '...'
      : theme.description;
  }, [theme.description]);

  // Memoize price display
  const priceDisplay = useMemo(() => 
    `${theme.pricing.currency === 'USD' ? '$' : theme.pricing.currency} ${theme.pricing.basePrice}`,
    [theme.pricing.currency, theme.pricing.basePrice]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="group flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
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
            className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            Preview <ExternalLink size={16} />
          </Link>
          <span className="px-3 py-1 bg-background/90 backdrop-blur-sm text-foreground rounded-full text-xs font-bold">
            {priceDisplay}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {categoryName}
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

        <div 
          className="text-sm text-muted-foreground line-clamp-2 mb-4 prose-sm dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: truncatedDesc }}
        />

        {/* Tags - memoized slice */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {useMemo(() => theme.tags.slice(0, 3).map((tag: string) => (
            <span 
              key={tag} 
              className="px-2 py-1 bg-muted rounded-md text-[10px] font-medium text-muted-foreground mix-blend-multiply dark:mix-blend-screen"
            >
              #{tag}
            </span>
          )), [theme.tags])}
          {theme.tags.length > 3 && (
            <span className="px-2 py-1 bg-muted rounded-md text-[10px] font-medium text-muted-foreground">
              +{theme.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for deep equality check
  return prevProps.theme.id === nextProps.theme.id && 
         prevProps.categoryName === nextProps.categoryName;
});

ThemeCard.displayName = 'ThemeCard';

// Memoized category button to prevent re-renders
const CategoryButton = memo(({ 
  category, 
  isActive, 
  onClick 
}: { 
  category: { id: string; name: string }; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted/50 hover:bg-muted text-muted-foreground'
    }`}
  >
    {category.name}
  </button>
));

CategoryButton.displayName = 'CategoryButton';

export default function ThemesGallery() {
  const { themes, isLoading: themesLoading } = useWebThemes();
  const { categories, isLoading: categoriesLoading } = useThemeCategories();

  const isLoading = themesLoading || categoriesLoading;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Use deferred value for search to keep input responsive
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Use optimized filtered themes hook with DSA best practices
  const filteredThemes = useFilteredThemes(themes, deferredSearchQuery, activeCategory);

  // Create category lookup Map for O(1) access
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(cat => {
      map.set(cat.id, cat.name);
      map.set(cat.name, cat.name); // Handle both id and name lookups
    });
    return map;
  }, [categories]);

  // Memoized callback for category selection
  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);

  // Clear filters callback
  const clearFilters = useCallback(() => {
    setActiveCategory('all');
    setSearchQuery('');
  }, []);

  // Virtualization setup for large theme lists
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Calculate columns based on viewport
  const [columnCount, setColumnCount] = useState(3);
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 768) setColumnCount(1);
      else if (width < 1024) setColumnCount(2);
      else setColumnCount(3);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Row count for virtualization
  const rowCount = useMemo(() => 
    Math.ceil(filteredThemes.length / columnCount),
    [filteredThemes.length, columnCount]
  );

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 450, // Estimated row height
    overscan: 3,
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium animate-pulse">Loading Web Themes Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <SEO {...seoConfig.themes} />
      <Header />
      <div className="section-container">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black tracking-tight mb-6"
          >
            Web Themes Portfolio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Premium, high-performance web themes designed for business and branding.
          </motion.p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <CategoryButton
              category={{ id: 'all', name: 'All Themes' }}
              isActive={activeCategory === 'all'}
              onClick={() => handleCategoryChange('all')}
            />
            {categories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isActive={activeCategory === category.id}
                onClick={() => handleCategoryChange(category.id)}
              />
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

        {/* Themes Grid with Virtualization */}
        <div 
          ref={parentRef}
          className="overflow-auto scroll-smooth"
          style={{ height: '800px' }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualRow) => {
              const rowIndex = virtualRow.index;
              const startIndex = rowIndex * columnCount;
              const rowThemes = filteredThemes.slice(startIndex, startIndex + columnCount);
              
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8"
                  data-index={virtualRow.index}
                >
                  {rowThemes.map((theme) => (
                    <ThemeCard 
                      key={theme.id} 
                      theme={theme} 
                      categoryName={categoryMap.get(theme.category) || theme.category} 
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {filteredThemes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground font-medium">No themes found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
