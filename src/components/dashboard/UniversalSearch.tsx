import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Smartphone, Users, Mail, NotebookPen, BookMarked } from 'lucide-react';
import { AppEntry, Tester, Subscriber, BlogPost, Note } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UniversalSearchProps {
    apps: AppEntry[];
    testers: Tester[];
    subscribers: Subscriber[];
    blogs: BlogPost[];
    notes: Note[];
}

interface SearchResult {
    type: 'app' | 'tester' | 'subscriber' | 'blog' | 'note';
    id: string;
    title: string;
    subtitle?: string;
    path: string;
}

export const UniversalSearch: React.FC<UniversalSearchProps> = ({ apps, testers, subscribers, blogs, notes }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();

    // Keyboard shortcut: Cmd+K or Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Search logic
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setSelectedIndex(0);
            return;
        }

        const searchTerm = query.toLowerCase();
        const allResults: SearchResult[] = [];

        // Search apps
        apps.forEach(app => {
            if (app.appName?.toLowerCase().includes(searchTerm) ||
                app.slug?.toLowerCase().includes(searchTerm)) {
                allResults.push({
                    type: 'app',
                    id: app.id,
                    title: app.appName,
                    subtitle: app.status,
                    path: '/admin/settings'
                });
            }
        });

        // Search testers
        testers.forEach(tester => {
            if (tester.displayName?.toLowerCase().includes(searchTerm) ||
                tester.email?.toLowerCase().includes(searchTerm)) {
                allResults.push({
                    type: 'tester',
                    id: tester.uid,
                    title: tester.displayName,
                    subtitle: tester.email,
                    path: '/admin/testers'
                });
            }
        });

        // Search blogs
        blogs.forEach(blog => {
            if (blog.title?.toLowerCase().includes(searchTerm) ||
                blog.slug?.toLowerCase().includes(searchTerm)) {
                allResults.push({
                    type: 'blog',
                    id: blog.id,
                    title: blog.title,
                    subtitle: blog.date,
                    path: '/admin/blogs'
                });
            }
        });

        // Search notes
        notes.forEach(note => {
            if (note.title?.toLowerCase().includes(searchTerm) ||
                note.content?.toLowerCase().includes(searchTerm) ||
                note.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) {
                allResults.push({
                    type: 'note',
                    id: note.id,
                    title: note.title,
                    subtitle: note.tags?.slice(0, 3).join(', ') || 'No tags',
                    path: '/admin/notes'
                });
            }
        });

        setResults(allResults.slice(0, 10)); // Limit to 10 results
        setSelectedIndex(0);
    }, [query, apps, testers, subscribers, blogs, notes]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    const handleSelect = (result: SearchResult) => {
        navigate(result.path);
        setOpen(false);
        setQuery('');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'app': return <Smartphone className="w-4 h-4 text-primary" />;
            case 'tester': return <Users className="w-4 h-4 text-blue-500" />;
            case 'subscriber': return <Mail className="w-4 h-4 text-green-500" />;
            case 'blog': return <NotebookPen className="w-4 h-4 text-orange-500" />;
            case 'note': return <BookMarked className="w-4 h-4 text-yellow-500" />;
            default: return <Search className="w-4 h-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'app': return 'App';
            case 'tester': return 'User';
            case 'subscriber': return 'Subscriber';
            case 'blog': return 'Blog';
            case 'note': return 'Note';
            default: return '';
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setOpen(true)}
                className="hidden lg:flex items-center gap-2 bg-muted/50 border border-border px-3 py-2 rounded-xl hover:bg-muted transition-all cursor-pointer w-64"
            >
                <Search size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium flex-1 text-left">Universal search...</span>
                <kbd className="text-[10px] font-bold bg-background px-1.5 py-0.5 rounded border border-border text-muted-foreground">⌘K</kbd>
            </button>

            {/* Search Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                        <Search className="w-5 h-5 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search apps, users, blogs, notes..."
                            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                            autoFocus
                        />
                    </div>

                    {/* Results */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {query && results.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No results found for "{query}"
                            </div>
                        )}

                        {results.length > 0 && (
                            <div className="p-2">
                                {results.map((result, index) => (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        onClick={() => handleSelect(result)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                                            index === selectedIndex
                                                ? "bg-primary/10 text-foreground"
                                                : "hover:bg-muted text-foreground"
                                        )}
                                    >
                                        <div className="flex-shrink-0">
                                            {getIcon(result.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{result.title}</div>
                                            {result.subtitle && (
                                                <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                                                {getTypeLabel(result.type)}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {!query && (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                <p className="font-medium mb-2">Quick Search</p>
                                <p className="text-xs">Search across apps, users, blogs, and notes</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">↑↓</kbd>
                                Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">↵</kbd>
                                Select
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">Esc</kbd>
                                Close
                            </span>
                        </div>
                        <span>{results.length} results</span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
