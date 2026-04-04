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
import DownloadApkButton from '@/components/DownloadApkButton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { DefaultTemplate } from '@/richtexteditor/DefaultTemplate';
import {
    ChevronLeft,

    Download,
    MessageSquare,
    Send,
    Sparkles,
    Share2,
    Loader2,
    Users,
    Mail,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

    const pageTitle = app?.appName || (isAppLoading ? "Loading App..." : "App Not Found | Jakir Hossen");
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

            <main className="container mx-auto px-4 pt-20 md:pt-24 pb-12 space-y-4 md:space-y-6">

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
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] font-black uppercase px-2 py-0.5",
                                            app.status === 'production' ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                        )}>
                                            {app.status === 'closed_testing' ? 'Closed Testing' : app.status}
                                        </Badge>
                                    )}
                                    {app.appName && (
                                        <h1 className="text-xl md:text-2xl lg:text-3xl font-black leading-tight tracking-tight drop-shadow-sm">{app.appName}</h1>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-4 w-full md:w-auto">
                                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                                        {app.status === 'closed_testing' && (
                                            <Button size="lg" className="h-14 md:h-16 px-8 md:px-10 text-base md:text-lg font-black rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 group w-full lg:flex-[1.5]" asChild>
                                                <a href="https://groups.google.com/g/jakir-tester" target="_blank" rel="noopener noreferrer">
                                                    <div className="mr-2 md:mr-3 w-8 h-8 md:w-9 md:h-9 bg-white rounded-full flex items-center justify-center p-1.5 shadow-sm shrink-0">
                                                        <img
                                                            src="/google.png"
                                                            alt="Google"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                    Join Tester Group
                                                </a>
                                            </Button>
                                        )}
                                        {app.playStoreUrl && (
                                            <GooglePlayButton url={app.playStoreUrl} />
                                        )}
                                    </div>

                                    {app.apkUrl && (
                                        <DownloadApkButton url={app.apkUrl} />
                                    )}

                                    {app.status === 'closed_testing' && (
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                            <p className="text-xs md:text-sm text-indigo-500/80 font-bold italic">
                                                Join group with your Play Store email to unlock access
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Minimalist Instruction Section */}
                {app.status === 'closed_testing' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto w-full"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-none bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                    <Users size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-base font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">Tester Registration</h4>
                                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
                                        Join our official Google Group with your Play Store email address. This step is mandatory to obtain download permissions for closed testing builds.
                                    </p>
                                </div>
                            </Card>

                            <Card className="border-none bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                    <AlertCircle size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg md:text-xl font-bold text-indigo-600 dark:text-indigo-400">টেস্টিং নির্দেশাবলী</h4>
                                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
                                        অ্যাপটি ডাউনলোড করতে প্লে-স্টোর ইমেইল ব্যবহার করে আমাদের টেস্টিং গ্রুপে যোগ দিন। এটি পাবলিকলি উন্মুক্ত হওয়ার আগে টেস্টিংয়ের জন্য একান্ত আবশ্যক।
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {/* About Section */}
                {app.description && (
                    <div className="min-h-[400px] sm:min-h-[500px] border-2 border-primary/20 rounded-3xl overflow-hidden bg-background/50 shadow-xl relative">
                        <DefaultTemplate
                            readOnly={true}
                            className="newspaper-article prose dark:prose-invert prose-slate max-w-none"
                            onReady={(methods) => {
                                if (app.description) {
                                    setTimeout(() => methods.injectHTML(app.description), 100);
                                }
                            }}
                        />
                    </div>

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
