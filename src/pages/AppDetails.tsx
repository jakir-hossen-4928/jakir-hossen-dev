import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db as firestore } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { addCommentToCache } from '@/lib/syncService';
import { AppEntry, Comment } from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GooglePlayButton from '@/components/GooglePlayButton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import {
    ChevronLeft,
    Download,
    MessageSquare,
    Send,
    Sparkles,
    Share2,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppBySlug } from '@/hooks/useApps';
import { useComments } from '@/hooks/useComments';

import { AppDetailSkeleton } from '@/components/skeletons/ContentSkeletons';

const AppDetails = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [newComment, setNewComment] = useState('');

    const { app, isLoading: isAppLoading } = useAppBySlug(slug);
    const { comments, isLoading: isCommentsLoading } = useComments(app?.id);
    const { showLogin } = useAuth();

    const pageTitle = app?.appName || (isAppLoading ? "Loading App..." : "App Not Found | Sajuriya Studio");
    usePageTitle(pageTitle);

    const postComment = async () => {
        if (!user || !app) {
            showLogin();
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
                timestamp: Timestamp.now()
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

    if (isAppLoading && !app) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 pt-16 md:pt-20 pb-12">
                    <AppDetailSkeleton />
                </main>
                <Footer />
            </div>
        );
    }

    if (!app) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <p className="text-muted-foreground">App not found</p>
                    <Button onClick={() => navigate('/apps')} className="mt-4">Back to Gallery</Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="container mx-auto px-4 pt-24 md:pt-32 pb-12 space-y-4 md:space-y-6">

                {/* Back Button & Share */}
                <div className="flex items-center justify-between mt-2 md:mt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/apps')}
                        className="rounded-xl hover:bg-primary/10 hover:text-primary text-[10px] sm:text-xs"
                    >
                        <ChevronLeft className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Back to Gallery
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
                        {/* Premium Cover Photo */}
                        <div className="w-full h-40 md:h-[250px] lg:h-[300px] overflow-hidden relative">
                            <img
                                src="/cover-photo.jpg"
                                alt="App Cover"
                                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Premium Gradient Overlay for depth and text legibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/10 to-transparent"></div>
                            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
                        </div>

                        <div className="p-6 md:p-8 -mt-10 md:-mt-12 relative">
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                                {/* App Icon */}
                                <div className="w-20 h-20 md:w-28 md:h-28 rounded-[22%] overflow-hidden shadow-2xl border-4 border-card bg-card flex-shrink-0 z-10">
                                    {app.icon ? (
                                        <img src={app.icon} alt={app.appName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted">
                                            <Sparkles className="w-8 h-8 text-primary/20" />
                                        </div>
                                    )}
                                </div>

                                {/* Title & Status */}
                                <div className="flex-1 space-y-0.5 mb-1">
                                    {app.status && (
                                        <Badge variant="outline" className="text-[8px] py-0 h-3.5 mb-0.5 bg-background/50 backdrop-blur-md">{app.status.toUpperCase()}</Badge>
                                    )}
                                    {app.appName && (
                                        <h1 className="text-xl md:text-2xl lg:text-3xl font-black leading-tight tracking-tight drop-shadow-sm">{app.appName}</h1>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                    {app.playStoreUrl && (
                                        <GooglePlayButton url={app.playStoreUrl} />
                                    )}
                                    {app.apkUrl && (
                                        <Button size="lg" className="h-12 md:h-14 px-6 md:px-8 text-sm md:text-base font-black rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group" asChild>
                                            <a href={app.apkUrl} target="_blank" rel="noopener noreferrer">
                                                <Download className="mr-2 md:mr-3 w-4 h-4 md:w-5 md:h-5 group-hover:animate-bounce" /> Download APK
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
                    <Card className="border-none glassmorphism rounded-[32px] p-6 md:p-8">
                        <h3 className="text-lg md:text-xl font-black mb-6 flex items-center gap-3">
                            <Sparkles className="text-primary w-4 h-4 md:w-5 md:h-5" /> About Application
                        </h3>
                        <div className="prose prose-sm prose-invert max-w-none prose-p:text-muted-foreground prose-p:font-medium prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: app.description }} />
                    </Card>
                )}

                {/* Comments Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg md:text-xl font-black flex items-center gap-3">
                            <MessageSquare className="text-primary" size={18} /> Community Feedback
                        </h3>
                        <Badge variant="outline" className="font-bold text-[10px]">{comments.length} Comments</Badge>
                    </div>

                    <Card className="border-none glassmorphism rounded-[32px] p-6 md:p-8 overflow-hidden">
                        <div className="space-y-8">
                            {/* New Comment Input */}
                            <div className="space-y-4">
                                {!user ? (
                                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                                        <p className="font-bold mb-4">Want to share your thoughts?</p>
                                        <Button onClick={showLogin} variant="outline" className="rounded-xl font-black">LOGIN TO COMMENT</Button>
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
                                {isCommentsLoading && comments.length === 0 ? (
                                    <div className="flex justify-center py-10">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
                                    </div>
                                ) : comments.length === 0 ? (
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
                                                            : typeof comment.timestamp === 'object' && comment.timestamp && 'toDate' in comment.timestamp
                                                                ? (comment.timestamp as { toDate: () => Date }).toDate().toLocaleDateString()
                                                                : 'Recently'}
                                                    </span>
                                                    <p className="text-[11px] md:text-xs text-foreground leading-relaxed">{comment.content}</p>
                                                </div>
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
