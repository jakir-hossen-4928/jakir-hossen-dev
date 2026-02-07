import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, Calendar, ChevronRight, BookOpen, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import categoriesData from '@/data/categories.json';
import { useFilteredBlogs } from '@/hooks/useBlogs';
import { BlogPost } from '@/lib/types';
import * as ReactWindow from 'react-window';
import * as ASModule from 'react-virtualized-auto-sizer';
import { usePageTitle } from '@/hooks/usePageTitle';

// Forcing compatibility with various build environments (Vite/Rollup)
const RW: any = ReactWindow;
const AS: any = ASModule;

const FixedSizeList = RW.FixedSizeList || RW.default?.FixedSizeList || RW.default;
const AutoSizer = AS.AutoSizer || AS.default?.AutoSizer || AS.default || AS;
const List = FixedSizeList;

interface RowData {
    columnCount: number;
    filteredBlogs: BlogPost[];
    isSearching: boolean;
}

const BlogGallery = () => {
    usePageTitle("Latest Articles");
    const [searchQuery, setSearchQuery] = useState('');

    // Blog Card Component
    const BlogCard = ({ blog, idx, isLatest }: { blog: BlogPost, idx: number, isLatest: boolean }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: (idx % 3) * 0.05 }}
            className="h-full p-2 md:p-3"
        >
            <Link to={`/blogs/${blog.slug}`} className="group block h-full">
                <article className="h-full flex flex-col bg-card border border-border rounded-3xl overflow-hidden hover:bg-accent/5 transition-all hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 group-hover:-translate-y-1 duration-300">
                    <div className={cn("aspect-[16/9] relative flex items-center justify-center p-4 overflow-hidden", blog.thumbnailColor || 'bg-primary')}>
                        <div className="absolute inset-0 bg-black/5 mix-blend-overlay" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {isLatest && (
                            <div className="absolute top-3 right-3 bg-primary text-primary-foreground font-black text-[7px] px-2 py-1 rounded-full uppercase tracking-tighter z-20 shadow-lg">
                                Latest
                            </div>
                        )}
                        <h3 className="relative z-10 text-white text-lg md:text-xl font-black text-center tracking-tighter leading-tight drop-shadow-xl px-4 group-hover:scale-105 transition-transform duration-500 uppercase italic line-clamp-2">
                            {blog.title}
                        </h3>
                    </div>
                    <div className="p-4 md:p-6 flex flex-col flex-grow">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {(blog.categories || []).slice(0, 2).map((cat: string) => (
                                <Badge key={cat} variant="secondary" className="px-2 py-0 h-5 rounded-md text-[8px] font-black uppercase bg-muted/50 border-border text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors whitespace-nowrap">
                                    {cat}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-muted-foreground text-xs md:text-sm font-medium leading-relaxed line-clamp-2 mb-4">
                            {blog.excerpt || (blog.description ? blog.description.replace(/<[^>]*>/g, '').slice(0, 80) + '...' : 'Dive in...')}
                        </p>
                        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between group/btn">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/80 group-hover/btn:text-primary transition-colors">
                                Read Now
                            </span>
                            <ChevronRight size={16} className="text-primary group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </article>
            </Link>
        </motion.div>
    );

    // Row Renderer for Virtualized List
    const Row = ({ index, style, data }: { index: number, style: React.CSSProperties, data: RowData }) => {
        const { columnCount, filteredBlogs, isSearching } = data;
        const items = [];
        for (let i = 0; i < columnCount; i++) {
            const itemIndex = index * columnCount + i;
            if (itemIndex < filteredBlogs.length) {
                const blog = filteredBlogs[itemIndex];
                items.push(
                    <div key={blog.id || itemIndex} style={{ width: `${100 / columnCount}%` }} className="h-full">
                        <BlogCard
                            blog={blog}
                            idx={itemIndex}
                            isLatest={itemIndex === 0 && !isSearching}
                        />
                    </div>
                );
            }
        }

        return (
            <div style={style} className="flex px-2 md:px-4">
                {items}
            </div>
        );
    };

    const BlogGallery = () => {
        const [searchTerm, setSearchTerm] = useState('');
        const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
        const [activeFilter, setActiveFilter] = useState('All Articles');

        const { blogs, isLoading } = useFilteredBlogs(searchTerm, selectedCategory);

        const categories = useMemo(() => [
            { name: 'All Articles', type: 'all' },
            ...categoriesData.flatMap(cat => [
                { name: cat.name, type: 'parent', parent: cat.name },
                ...cat.subcategories.map(sub => ({ name: sub, type: 'sub', parent: cat.name }))
            ])
        ], []);

        return (
            <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col">
                <Header />
                <main className="flex-grow pt-20 md:pt-24 pb-0 px-4 md:px-8 flex flex-col">
                    <div className="max-w-7xl mx-auto w-full flex flex-col flex-grow">
                        {/* Hero Section & Search/Filter */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
                            <div className="space-y-3 max-w-2xl text-center md:text-left">
                                <Badge variant="outline" className="px-3 py-0.5 rounded-full border-primary/20 text-primary uppercase tracking-[0.2em] text-[9px] font-black mx-auto md:mx-0">
                                    Knowledge Base
                                </Badge>
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none italic uppercase">
                                    THE <span className="text-primary NOT-italic font-black">BLOG.</span>
                                </h1>
                                <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
                                    Deep dives into modern web technologies, performance optimization, and premium user experiences.
                                </p>
                                <div className="pt-4 flex justify-center md:justify-start gap-4">
                                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                                        {blogs?.length || 0} Articles Found
                                    </Badge>
                                    {isLoading && <span className="text-xs animate-pulse text-muted-foreground">Syncing...</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-grow md:w-80 group">
                                    <div className="absolute inset-0 bg-primary/10 blur-3xl group-focus-within:bg-primary/20 transition-all rounded-full" />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search articles (fuzzy)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-12 h-14 rounded-2xl bg-muted/30 border-border text-base font-bold transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 relative z-10"
                                    />
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-14 w-14 rounded-2xl bg-muted/30 border-border hover:bg-muted/50 hover:border-primary/50 transition-all shrink-0"
                                        >
                                            <Filter className={cn("w-5 h-5 transition-colors", activeFilter !== 'All Articles' ? "text-primary" : "text-muted-foreground")} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 bg-popover border-border rounded-2xl p-2 max-h-[400px] overflow-y-auto no-scrollbar shadow-2xl z-50">
                                        <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-border mb-2">
                                            Filter by Category
                                        </div>
                                        {categories.map((cat, idx) => (
                                            <DropdownMenuItem
                                                key={`${cat.name}-${idx}`}
                                                onClick={() => {
                                                    setSelectedCategory(cat.type === 'all' ? null : cat.name);
                                                    setActiveFilter(cat.name);
                                                }}
                                                className={cn(
                                                    "rounded-xl px-4 py-3 mb-1 cursor-pointer transition-all",
                                                    activeFilter === cat.name
                                                        ? "bg-primary/10 text-primary font-bold"
                                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                                    cat.type === 'sub' && "pl-8 text-xs opacity-80"
                                                )}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className={cn(cat.type === 'parent' ? "font-black uppercase text-[10px] tracking-wider" : "text-[11px]")}>
                                                        {cat.name}
                                                    </span>
                                                    {activeFilter === cat.name && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    )}
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>


                        {/* Blog Content Section */}
                        <div className="relative flex-grow min-h-[600px] mb-20 overflow-hidden bg-background/50 border border-border/5 rounded-[3rem]">
                            {isLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 p-4 md:p-8">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-card border border-border rounded-[2.5rem] overflow-hidden p-0 h-[320px] md:h-[480px]">
                                            <Skeleton className="h-[180px] md:h-[280px] w-full" />
                                            <div className="p-4 md:p-10 space-y-4">
                                                <div className="flex gap-2"><Skeleton className="h-4 w-12 rounded-full" /><Skeleton className="h-4 w-12 rounded-full" /></div>
                                                <Skeleton className="h-6 w-3/4" /><Skeleton className="h-3 w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : blogs && blogs.length > 0 ? (
                                /* Fallback to standard grid for small number of blogs to ensure visibility */
                                blogs.length < 15 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 p-3 md:p-8 overflow-y-auto max-h-full no-scrollbar relative">
                                        {/* Debug Marker */}
                                        <div className="absolute top-0 right-4 text-[8px] opacity-10 pointer-events-none">
                                            GRID_LAYOUT_ACTIVE ({blogs.length} items)
                                        </div>
                                        {blogs.map((blog, idx) => (
                                            <div key={blog.id || idx} className="h-full">
                                                <BlogCard
                                                    blog={blog}
                                                    idx={idx}
                                                    isLatest={idx === 0 && !searchTerm && !selectedCategory}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="absolute inset-0">
                                        <AutoSizer>
                                            {({ height, width }: { height: number, width: number }) => {
                                                const finalHeight = height || 800;
                                                const finalWidth = width || 1240;

                                                let columnCount = 2; // Default to 2 for mobile
                                                if (finalWidth >= 1024) columnCount = 3;
                                                else columnCount = 2; // Strict 2-column for all mobile/tablet unless large desktop

                                                const rowCount = Math.ceil(blogs.length / columnCount);
                                                const rowHeight = finalWidth < 768 ? 320 : 450; // Dynamic height based on screen

                                                console.log(`[BlogGallery] Virtual List Render: ${width}x${height}, Items: ${blogs.length}`);

                                                return (
                                                    <List
                                                        height={finalHeight}
                                                        itemCount={rowCount}
                                                        itemSize={rowHeight}
                                                        width={finalWidth}
                                                        itemData={{
                                                            columnCount,
                                                            filteredBlogs: blogs,
                                                            isSearching: !!searchTerm || !!selectedCategory
                                                        }}
                                                        className="no-scrollbar"
                                                        style={{ overflowX: 'hidden' }}
                                                    >
                                                        {Row}
                                                    </List>
                                                );
                                            }}
                                        </AutoSizer>
                                    </div>
                                )
                            ) : (
                                <div className="py-32 text-center h-full flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-8 shadow-inner">
                                        <BookOpen size={40} className="text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-3xl font-black italic mb-4 tracking-tighter uppercase text-foreground">NO ARTICLES FOUND.</h3>
                                    <p className="text-muted-foreground text-lg">Try adjusting your search or category selection.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    };

    export default BlogGallery;
