import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db as firestore } from '@/lib/firebase';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/AuthContext';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { getAppBySlug, syncComments, subscribeToComments, addCommentToCache } from '@/lib/syncService';
import { AppEntry, Comment } from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GooglePlayButton from '@/components/GooglePlayButton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    ChevronLeft,
    Download,
    MessageSquare,
    Send,
    Sparkles,
    Share2
} from 'lucide-react';
import { motion } from 'framer-motion';

const AppDetails = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user, login } = useAuth();

    const [app, setApp] = useState<AppEntry | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    usePageTitle(app?.appName || "Loading App...");

    // Load app data
    useEffect(() => {
        if (!slug) return;

        const loadApp = async () => {
            try {
                // 1. Instant load from local DB
                const cachedApp = await db.apps.where('slug').equals(slug).first();
                if (cachedApp) {
                    setApp(cachedApp);
                    setLoading(false);
                }

                // 2. Background Sync
                const appData = await getAppBySlug(slug);
                if (!appData) {
                    if (!cachedApp) {
                        toast.error('App not found');
                        navigate('/apps');
                    }
                    return;
                }
                setApp(appData);
            } catch (error) {
                console.error('Error loading app:', error);
                toast.error('Failed to load app');
            } finally {
                setLoading(false);
            }
        };

        loadApp();
    }, [slug, navigate]);

    // Load comments with real-time updates
    useEffect(() => {
        if (!app?.id) return;

        const loadComments = async () => {
            const cachedComments = await syncComments(app.id);
            setComments(cachedComments);
        };

        loadComments();

        // Subscribe to real-time updates
        const unsubscribe = subscribeToComments(app.id, (updatedComments) => {
            setComments(updatedComments);
        });

        return () => unsubscribe();
    }, [app?.id]);



    const postComment = async () => {
        if (!user || !app) {
            await login();
            return;
        }

        if (!newComment.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        try {
            const comment: Omit<Comment, 'id'> = {
                appId: app.id,
                userId: user.uid,
                displayName: user.displayName || user.email || 'Anonymous',
                content: newComment,
                timestamp: Timestamp.now() as any
            };

            // Optimistic update to cache
            const tempComment = { ...comment, id: `temp_${Date.now()}` };
            await addCommentToCache(tempComment as Comment);

            // Add to Firestore
            await addDoc(collection(firestore, 'apps', app.id, 'comments'), comment);

            setNewComment('');
            toast.success('Comment posted!');
        } catch (error) {
            console.error('Error posting comment:', error);
            toast.error('Failed to post comment');
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!app) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="container mx-auto px-4 py-12 space-y-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs">
                    <Link to="/apps" className="text-muted-foreground hover:text-primary transition-colors">
                        Apps
                    </Link>
                    <ChevronLeft className="w-4 h-4 rotate-180 text-muted-foreground opacity-50" />
                    <span className="text-foreground font-medium">{app.appName}</span>
                </div>

                {/* Back Button & Share */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/apps')}
                        className="rounded-xl hover:bg-primary/10 hover:text-primary text-xs"
                    >
                        <ChevronLeft className="mr-2 w-4 h-4" /> Back to Gallery
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="rounded-xl gap-2 text-xs"
                    >
                        <Share2 className="w-3 h-3" /> Share
                    </Button>
                </div>

                {/* App Details */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-[32px] blur-xl opacity-20"></div>
                    <Card className="relative overflow-hidden border border-white/10 glassmorphism rounded-[32px]">
                        {/* Cover Photo */}
                        <div className="w-full h-48 md:h-64 overflow-hidden bg-gradient-to-br from-primary/10 to-blue-500/10 relative">
                            <img
                                src={app.coverPhoto || "https://i.ibb.co.com/YTN1jtJp/he.jpg"}
                                alt={app.appName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (target.src !== "https://i.ibb.co.com/YTN1jtJp/he.jpg") {
                                        target.src = "https://i.ibb.co.com/YTN1jtJp/he.jpg";
                                    }
                                }}
                            />
                            {/* Gradient Overlay for text readability if needed */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                        </div>

                        <div className="p-8 md:p-12 -mt-20 relative">
                            <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
                                {/* App Icon */}
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[22%] overflow-hidden shadow-2xl border-4 border-card bg-card flex-shrink-0 z-10">
                                    {app.icon ? (
                                        <img src={app.icon} alt={app.appName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted">
                                            <Sparkles className="w-10 h-10 text-primary/20" />
                                        </div>
                                    )}
                                </div>

                                {/* Title & Status */}
                                <div className="flex-1 space-y-2 mb-2">
                                    {app.status && (
                                        <Badge variant="outline" className="text-[10px] py-0 h-5 mb-1 bg-background/50 backdrop-blur-md">{app.status.toUpperCase()}</Badge>
                                    )}
                                    {app.appName && (
                                        <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight drop-shadow-sm">{app.appName}</h1>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                    {app.playStoreUrl && (
                                        <GooglePlayButton url={app.playStoreUrl} />
                                    )}
                                    {app.apkUrl && (
                                        <Button size="lg" className="h-14 px-8 text-base font-black rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group" asChild>
                                            <a href={app.apkUrl} target="_blank" rel="noopener noreferrer">
                                                <Download className="mr-3 w-5 h-5 group-hover:animate-bounce" /> Download APK
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* About Section */}
                {app.description && (
                    <Card className="border-none glassmorphism rounded-[32px] p-8 md:p-12">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            <Sparkles className="text-primary w-5 h-5" /> About Application
                        </h3>
                        <div className="prose prose-sm prose-invert max-w-none prose-p:text-muted-foreground prose-p:font-medium prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: app.description }} />
                    </Card>
                )}

                {/* Comments Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black flex items-center gap-3">
                            <MessageSquare className="text-primary" size={20} /> Community Feedback
                        </h3>
                        <Badge variant="outline" className="font-bold text-[10px]">{comments.length} Comments</Badge>
                    </div>

                    <Card className="border-none glassmorphism rounded-[32px] p-8 overflow-hidden">
                        <div className="space-y-8">
                            {/* New Comment Input */}
                            <div className="space-y-4">
                                {!user ? (
                                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                                        <p className="font-bold mb-4">Want to share your thoughts?</p>
                                        <Button onClick={login} variant="outline" className="rounded-xl font-black">LOGIN TO COMMENT</Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-4 items-start">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                                            <span className="text-sm font-black text-primary">{user.displayName?.[0] || user.email?.[0]}</span>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="What do you think about this app?"
                                                className="w-full min-h-[100px] p-4 rounded-2xl bg-background border-2 border-border focus:ring-2 focus:ring-primary focus:border-primary resize-none font-medium text-sm transition-all text-foreground placeholder:text-muted-foreground"
                                            />
                                            <div className="flex justify-end">
                                                <Button onClick={postComment} className="rounded-xl h-12 px-6 font-black uppercase tracking-widest gap-2">
                                                    Post <Send size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Comments List */}
                            <div className="space-y-6 pt-8 border-t border-white/5">
                                {comments.length === 0 ? (
                                    <div className="text-center py-10 opacity-30">
                                        <p className="font-black uppercase tracking-widest text-xs">No feedback yet. Be the first!</p>
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={comment.id}
                                            className="flex gap-4 group p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-all"
                                        >
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                                                <span className="text-sm font-black text-primary">{comment.displayName?.[0] || 'U'}</span>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-foreground">{comment.displayName}</span>
                                                    <span className="text-xs text-muted-foreground">•</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {comment.timestamp instanceof Date
                                                            ? comment.timestamp.toLocaleDateString()
                                                            : (comment.timestamp as any)?.toDate?.()
                                                                ? (comment.timestamp as any).toDate().toLocaleDateString()
                                                                : 'Recently'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-foreground leading-relaxed">{comment.content}</p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AppDetails;
