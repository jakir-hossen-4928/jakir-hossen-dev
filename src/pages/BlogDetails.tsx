import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar, ChevronLeft, Clock, User, Share2, Tag, BookOpen, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { useBlogs } from '@/hooks/useBlogs';
import { usePageTitle } from '@/hooks/usePageTitle';

import { BlogDetailSkeleton } from '@/components/skeletons/ContentSkeletons';

const BlogDetails = () => {
    const { slug } = useParams<{ slug: string }>();
    const { blogs, isLoading } = useBlogs();

    const blog = blogs.find(b => b.slug === slug);
    const pageTitle = blog?.title || (isLoading ? "Loading Article..." : "Article Not Found | Sajuriya Studio");
    usePageTitle(pageTitle);

    if (isLoading && !blog) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Header />
                <main className="pb-12 pt-28 md:pt-32 px-4 md:px-8">
                    <BlogDetailSkeleton />
                </main>
                <Footer />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Header />
                <div className="flex items-center justify-center pt-64 pb-32">
                    <div className="text-center space-y-8">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <BookOpen size={40} className="text-muted-foreground/30" />
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter">ARTICLE NOT FOUND.</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">This deep dive might have been moved or is still being synchronized.</p>
                        <Link to="/blogs" className="block pt-4">
                            <Button variant="outline" className="rounded-full px-10 h-12 font-black uppercase tracking-widest">
                                <ChevronLeft className="mr-2 w-4 h-4" /> Back to Library
                            </Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="pb-12 pt-28 md:pt-32 px-4 md:px-8">
                {/* Background Decoration */}
                <div className="fixed inset-0 pointer-events-none -z-10">
                    <div className={cn("absolute top-0 left-0 w-full h-[50vh] opacity-10 blur-3xl", blog.thumbnailColor || 'bg-primary')} />
                    <div className="absolute top-0 left-0 w-full h-full bg-background" />
                </div>

                <article className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8 md:space-y-10"
                    >
                        {/* Header Details */}
                        <div className="space-y-6">

                            <div className="flex flex-wrap gap-2.5">
                                {blog.categories.map(cat => (
                                    <Badge key={cat} variant="outline" className="px-3 py-0.5 rounded-full border-primary/20 text-primary uppercase tracking-[0.2em] text-[9px] font-black">
                                        {cat}
                                    </Badge>
                                ))}
                            </div>

                            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1] italic uppercase">
                                {blog.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/5 text-muted-foreground font-medium text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User size={10} className="text-primary" />
                                    </div>
                                    <span className="font-black uppercase tracking-widest text-[9px]">{blog.author || 'Jakir Hossen'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-primary/60" />
                                    <span className="tabular-nums">{new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-primary/60" />
                                    <span>{Math.ceil(blog.description.length / 500)} min read</span>
                                </div>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 hover:text-primary transition-all ml-auto bg-white/5 px-3 py-1.5 rounded-full border border-white/5"
                                >
                                    <Share2 size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Share</span>
                                </button>
                            </div>
                        </div>

                        {/* Featured Thumbnail/Visual - Reduced scale */}
                        <div className={cn("aspect-video md:aspect-[21/7] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative flex items-center justify-center shadow-3xl shadow-black/60 group", blog.thumbnailColor || 'bg-primary')}>
                            <div className="absolute inset-0 bg-black/20 mix-blend-overlay group-hover:bg-black/10 transition-colors duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="relative z-10 p-8 text-center transform group-hover:scale-110 transition-transform duration-1000">
                                <h2 className="text-white text-3xl md:text-5xl font-black tracking-tighter italic drop-shadow-2xl opacity-40 select-none uppercase">
                                    {blog.title}
                                </h2>
                            </div>
                        </div>

                        {/* Main Content - Reduced padding */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-10 md:p-14 relative overflow-hidden shadow-inner">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                            <div
                                className="prose prose-invert prose-orange max-w-none 
                                prose-h1:text-3xl md:prose-h1:text-5xl prose-h1:font-black prose-h1:tracking-tighter prose-h1:uppercase prose-h1:italic prose-h1:mb-8
                                prose-h2:text-2xl md:prose-h2:text-4xl prose-h2:font-black prose-h2:tracking-tighter prose-h2:uppercase prose-h2:mt-12 prose-h2:mb-6
                                prose-h3:text-xl md:prose-h3:text-2xl prose-h3:font-black prose-h3:tracking-tight
                                prose-p:text-muted-foreground/90 prose-p:leading-[1.7] prose-p:text-base md:prose-p:text-lg prose-p:mb-6
                                prose-img:rounded-[1.5rem] md:prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:my-10
                                prose-strong:text-foreground prose-strong:font-black
                                prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-black
                                prose-ul:space-y-3 prose-li:text-base md:prose-li:text-lg
                                selection:bg-primary/30"
                                dangerouslySetInnerHTML={{ __html: blog.description }}
                            />

                            {/* Footer Tags */}
                            <div className="mt-12 pt-10 border-t border-white/5 flex flex-col gap-5">
                                <div className="flex items-center gap-2.5">
                                    <Tag size={14} className="text-primary" />
                                    <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Topics Explored</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {blog.categories.map(cat => (
                                        <Badge key={cat} variant="secondary" className="px-5 py-1.5 rounded-full font-bold uppercase text-[8px] bg-white/5 border-white/5 hover:bg-white/10 transition-all cursor-default">
                                            {cat}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </article>
            </main>
            <Footer />
        </div>
    );
};

export default BlogDetails;
