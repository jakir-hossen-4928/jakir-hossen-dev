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

const BlogDetails = () => {
    const { slug } = useParams<{ slug: string }>();
    const { blogs, isLoading } = useBlogs();

    const blog = blogs.find(b => b.slug === slug);

    if (isLoading && !blog) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
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
            <main className="pb-20 pt-32 px-4 md:px-8">
                {/* Background Decoration */}
                <div className="fixed inset-0 pointer-events-none -z-10">
                    <div className={cn("absolute top-0 left-0 w-full h-[60vh] opacity-10 blur-3xl", blog.thumbnailColor || 'bg-primary')} />
                    <div className="absolute top-0 left-0 w-full h-full bg-background" />
                </div>

                <article className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12"
                    >
                        {/* Header Details */}
                        <div className="space-y-8">
                            <Link to="/blogs" className="group inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                                    <ChevronLeft size={16} />
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-widest">Back to Library</span>
                            </Link>

                            <div className="flex flex-wrap gap-3">
                                {blog.categories.map(cat => (
                                    <Badge key={cat} variant="outline" className="px-4 py-1 rounded-full border-primary/20 text-primary uppercase tracking-[0.2em] text-[10px] font-black">
                                        {cat}
                                    </Badge>
                                ))}
                            </div>

                            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] italic uppercase">
                                {blog.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-8 border-t border-white/5 text-muted-foreground font-medium text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User size={12} className="text-primary" />
                                    </div>
                                    <span className="font-black uppercase tracking-widest text-[10px]">{blog.author || 'Jakir Hossen'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-primary/60" />
                                    <span className="tabular-nums">{new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-primary/60" />
                                    <span>{Math.ceil(blog.description.length / 500)} min read</span>
                                </div>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 hover:text-primary transition-all ml-auto bg-white/5 px-4 py-2 rounded-full border border-white/5"
                                >
                                    <Share2 size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
                                </button>
                            </div>
                        </div>

                        {/* Featured Thumbnail/Visual */}
                        <div className={cn("aspect-video md:aspect-[21/8] rounded-[3rem] overflow-hidden relative flex items-center justify-center shadow-3xl shadow-black/60 group", blog.thumbnailColor || 'bg-primary')}>
                            <div className="absolute inset-0 bg-black/20 mix-blend-overlay group-hover:bg-black/10 transition-colors duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="relative z-10 p-12 text-center transform group-hover:scale-110 transition-transform duration-1000">
                                <h2 className="text-white text-4xl md:text-6xl font-black tracking-tighter italic drop-shadow-2xl opacity-40 select-none uppercase">
                                    {blog.title}
                                </h2>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-8 md:p-20 relative overflow-hidden shadow-inner">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                            <div
                                className="prose prose-invert prose-orange max-w-none 
                                prose-h1:text-4xl md:prose-h1:text-6xl prose-h1:font-black prose-h1:tracking-tighter prose-h1:uppercase prose-h1:italic prose-h1:mb-12
                                prose-h2:text-3xl md:prose-h2:text-5xl prose-h2:font-black prose-h2:tracking-tighter prose-h2:uppercase prose-h2:mt-16 prose-h2:mb-8
                                prose-h3:text-2xl md:prose-h3:text-3xl prose-h3:font-black prose-h3:tracking-tight
                                prose-p:text-muted-foreground/90 prose-p:leading-[1.8] prose-p:text-lg md:prose-p:text-xl prose-p:mb-8
                                prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-img:my-16
                                prose-strong:text-foreground prose-strong:font-black
                                prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-black
                                prose-ul:space-y-4 prose-li:text-lg
                                selection:bg-primary/30"
                                dangerouslySetInnerHTML={{ __html: blog.description }}
                            />

                            {/* Footer Tags */}
                            <div className="mt-16 pt-12 border-t border-white/5 flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <Tag size={16} className="text-primary" />
                                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Topics Explored</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {blog.categories.map(cat => (
                                        <Badge key={cat} variant="secondary" className="px-6 py-2 rounded-full font-bold uppercase text-[9px] bg-white/5 border-white/5 hover:bg-white/10 transition-all cursor-default">
                                            {cat}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Newsletter Call to Action */}
                        <Card className="bg-primary/5 border-primary/20 rounded-[3rem] p-12 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                            <div className="relative z-10 text-center space-y-6 max-w-xl mx-auto">
                                <h3 className="text-3xl font-black italic tracking-tighter">LOVE THIS CONTENT?</h3>
                                <p className="text-muted-foreground font-medium">Join the mailing list to get monthly deep dives on tech and design directly in your inbox.</p>
                                <Link to="/">
                                    <Button className="rounded-full px-10 h-14 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                                        Join the Collective
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </motion.div>
                </article>
            </main>
            <Footer />
        </div>
    );
};

export default BlogDetails;
