import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, Calendar, ChevronRight, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import categoriesData from '@/data/categories.json';
import { useFilteredBlogs } from '@/hooks/useBlogs';
import { BlogPost } from '@/lib/types';
import * as ReactWindow from 'react-window';
import * as ASModule from 'react-virtualized-auto-sizer';

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

    // Blog Card Component
    const BlogCard = ({ blog, idx, isLatest }: { blog: BlogPost, idx: number, isLatest: boolean }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: (idx % 3) * 0.1 }}
            className="h-full p-4"
        >
            <Link to={`/blogs/${blog.slug}`} className="group block h-full">
                <article className="h-full flex flex-col bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.04] transition-all hover:border-primary/30 hover:shadow-3xl hover:shadow-primary/5 group-hover:-translate-y-2 duration-500">
                    <div className={cn("aspect-[16/10] relative flex items-center justify-center p-8 overflow-hidden transition-all group-hover:scale-105 duration-700", blog.thumbnailColor || 'bg-primary')}>
                        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {isLatest && (
                            <div className="absolute top-6 right-6 bg-white text-black font-black text-[8px] px-4 py-1.5 rounded-full uppercase tracking-widest shadow-2xl z-20">
                                Latest
                            </div>
                        )}
                        <h3 className="relative z-10 text-white text-2xl md:text-3xl font-black text-center tracking-tighter leading-tight drop-shadow-2xl px-6 group-hover:scale-110 transition-transform duration-700 uppercase italic">
                            {blog.title}
                        </h3>
                        <div className="absolute bottom-6 left-8 flex items-center gap-2 text-white/90 font-bold text-[9px] tracking-widest uppercase z-10">
                            <Calendar size={14} className="text-white" /> {new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                    <div className="p-10 flex flex-col flex-grow">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {(blog.categories || []).slice(0, 3).map((cat: string) => (
                                <Badge key={cat} variant="secondary" className="px-4 py-1 rounded-full text-[9px] font-black uppercase bg-white/5 border-white/10 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    {cat}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-muted-foreground/70 text-base font-medium leading-relaxed line-clamp-3 mb-10 group-hover:text-muted-foreground transition-colors">
                            {blog.excerpt || (blog.description ? blog.description.replace(/<[^>]*>/g, '').slice(0, 160) + '...' : 'No description available')}
                        </p>
                        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between group/btn">
                            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-primary group-hover/btn:tracking-[0.35em] transition-all duration-500">
                                Read Deep Dive
                            </span>
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-primary-foreground transition-all duration-500 shadow-xl">
                                <ChevronRight size={22} />
                            </div>
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

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col">
            <Header />
            <main className="flex-grow pt-32 pb-0 px-4 md:px-8 flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
                    {/* Hero Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 shrink-0">
                        <div className="space-y-4 max-w-2xl text-center md:text-left">
                            <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 text-primary uppercase tracking-[0.2em] text-[10px] font-black mx-auto md:mx-0">
                                Knowledge Base
                            </Badge>
                            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none italic uppercase">
                                THE <span className="text-primary NOT-italic font-black">BLOG.</span>
                            </h1>
                            <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
                                Deep dives into modern web technologies, performance optimization, and premium user experiences.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-grow md:w-80 group">
                                <div className="absolute inset-0 bg-primary/10 blur-3xl group-focus-within:bg-primary/20 transition-all rounded-full" />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search articles (fuzzy)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-14 rounded-2xl bg-white/[0.03] border-white/10 text-base font-bold transition-all focus:border-primary/50 focus:ring-0 relative z-10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categories UI Enhancement */}
                    <div className="relative mb-8 shrink-0">
                        <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar scroll-smooth no-scrollbar">
                            {categories.map((cat, idx) => (
                                <Badge
                                    key={`${cat.name}-${idx}`}
                                    variant={activeFilter === cat.name ? 'default' : 'outline'}
                                    onClick={() => {
                                        setSelectedCategory(cat.type === 'all' ? null : cat.name);
                                        setActiveFilter(cat.name);
                                    }}
                                    className={cn(
                                        "cursor-pointer px-5 py-2 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-wider whitespace-nowrap transition-all border-white/10 hover:border-primary/40",
                                        cat.type === 'parent' ? "bg-primary/5 text-primary border-primary/20" : "bg-white/[0.02]",
                                        activeFilter === cat.name ? "shadow-lg shadow-primary/20 scale-105 border-primary/50" : "text-muted-foreground/60"
                                    )}
                                >
                                    {cat.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Virtualized Blog Content */}
                    <div className="relative flex-grow min-h-[500px] mb-20 overflow-hidden">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden p-0 h-[480px]">
                                        <Skeleton className="h-[280px] w-full" />
                                        <div className="p-10 space-y-4">
                                            <div className="flex gap-2"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-16 rounded-full" /></div>
                                            <Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : blogs && blogs.length > 0 ? (
                            <AutoSizer>
                                {({ height, width }: { height: number, width: number }) => {
                                    let columnCount = 1;
                                    if (width >= 1024) columnCount = 3;
                                    else if (width >= 768) columnCount = 2;

                                    const rowCount = Math.ceil(blogs.length / columnCount);
                                    const rowHeight = 600;

                                    return (
                                        <List
                                            height={height}
                                            itemCount={rowCount}
                                            itemSize={rowHeight}
                                            width={width}
                                            itemData={{
                                                columnCount,
                                                filteredBlogs: blogs,
                                                isSearching: !!searchTerm || !!selectedCategory
                                            }}
                                            className="no-scrollbar"
                                        >
                                            {Row}
                                        </List>
                                    );
                                }}
                            </AutoSizer>
                        ) : (
                            <div className="col-span-full py-32 text-center">
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <BookOpen size={40} className="text-muted-foreground/30" />
                                </div>
                                <h3 className="text-3xl font-black italic mb-4 tracking-tighter uppercase">NO ARTICLES FOUND.</h3>
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
