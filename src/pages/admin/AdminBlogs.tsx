import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';
import { confirmToast } from '@/components/ui/ConfirmToast';
import { Plus, Trash2, Edit3, Loader2, Search, Calendar, Tag, ChevronDown, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db as firestore } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { DefaultTemplate, DefaultTemplateRef } from '@/richtexteditor/DefaultTemplate';
import { BlogPost } from '@/lib/types';
import { useBlogs } from '@/hooks/useBlogs';
import { deleteBlogPost } from '@/lib/syncService';
import { cn } from '@/lib/utils';
import categoriesData from '@/data/categories.json';

const THUMBNAIL_COLORS = [
    'bg-lime-500', 'bg-cyan-500', 'bg-indigo-600', 'bg-pink-500',
    'bg-orange-500', 'bg-emerald-500', 'bg-blue-600', 'bg-violet-600'
];

export const AdminBlogs: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Partial<BlogPost>>({});
    const [isSaving, setIsSaving] = useState(false);
    const editorRef = useRef<DefaultTemplateRef>(null);

    const { blogs, isLoading } = useBlogs();

    const filteredBlogs = blogs.filter(blog =>
        (blog.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (Array.isArray(blog.categories) && blog.categories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const handleOpenDialog = (blog?: BlogPost) => {
        if (blog) {
            setEditingBlog({ ...blog });
        } else {
            setEditingBlog({
                status: 'draft',
                title: '',
                slug: '',
                categories: [],
                date: new Date().toISOString().split('T')[0]
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingBlog.title) {
            toast.error("Title is required");
            return;
        }

        setIsSaving(true);
        try {
            const htmlDescription = editorRef.current?.getHTML() || editingBlog.description || '';
            const slug = editingBlog.slug || editingBlog.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
            const blogId = editingBlog.id || slug || Date.now().toString();

            const thumbnailColor = editingBlog.thumbnailColor || THUMBNAIL_COLORS[Math.floor(Math.random() * THUMBNAIL_COLORS.length)];

            const blogData: BlogPost = {
                id: blogId,
                slug,
                title: editingBlog.title,
                date: editingBlog.date || new Date().toISOString().split('T')[0],
                categories: editingBlog.categories || [],
                description: htmlDescription,
                excerpt: editingBlog.excerpt || htmlDescription.replace(/<[^>]*>/g, '').slice(0, 160) + '...',
                status: editingBlog.status || 'draft',
                author: editingBlog.author || 'Jakir Hossen',
                thumbnailColor,
                createdAt: editingBlog.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await setDoc(doc(firestore, 'blogs', blogId), blogData, { merge: true });
            toast.success(editingBlog.id ? "Blog updated" : "Blog created");
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Error saving blog");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBlog = async (blogId: string) => {
        confirmToast("Are you sure you want to delete this blog post?", async () => {
            try {
                await deleteBlogPost(blogId);
                toast.success("Blog post deleted successfully");
            } catch (error) {
                console.error("Error deleting blog:", error);
                toast.error("Failed to delete blog post");
            }
        });
    };

    const toggleCategory = (cat: string) => {
        const current = editingBlog.categories || [];
        if (current.includes(cat)) {
            setEditingBlog(prev => ({ ...prev, categories: current.filter(c => c !== cat) }));
        } else {
            setEditingBlog(prev => ({ ...prev, categories: [...current, cat] }));
        }
    };

    return (
        <Card className="border border-border shadow-2xl rounded-2xl overflow-hidden bg-card/30 backdrop-blur-xl">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between bg-white/[0.02] border-b border-border p-6 md:p-8 gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                    <div>
                        <CardTitle className="text-xl font-black text-foreground">Blog Management</CardTitle>
                        <CardDescription className="text-muted-foreground/70">Write and publish articles.</CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search blogs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10 rounded-xl bg-muted/50 border-border text-xs font-bold focus-visible:ring-primary/20"
                        />
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()} size="sm" className="rounded-xl h-10 font-black uppercase tracking-tight shadow-lg shadow-primary/20 w-full md:w-auto bg-primary hover:bg-primary/90">
                    <Plus size={16} className="mr-2" /> New Post
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <Table>
                        <TableHeader className="bg-white/[0.01]">
                            <TableRow className="hover:bg-transparent border-border">
                                <TableHead className="w-[100px] pl-6 text-[10px] font-black uppercase tracking-widest">Preview</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Title</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Categories</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                                <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index} className="border-border">
                                    <TableCell className="pl-6 py-4">
                                        <Skeleton className="w-16 h-10 rounded-lg" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-48 mb-2" />
                                        <Skeleton className="h-3 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Skeleton className="w-9 h-9 rounded-lg" />
                                            <Skeleton className="w-9 h-9 rounded-lg" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Table>
                        <TableHeader className="bg-white/[0.01]">
                            <TableRow className="hover:bg-transparent border-border">
                                <TableHead className="w-[100px] pl-6 text-[10px] font-black uppercase tracking-widest">Preview</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Title</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Categories</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                                <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBlogs.map(blog => (
                                <TableRow key={blog.id} className="border-border hover:bg-white/[0.02] transition-colors group">
                                    <TableCell className="pl-6 py-4">
                                        <div className={cn("w-16 h-10 rounded-lg flex items-center justify-center p-1 overflow-hidden text-[6px] font-bold text-white text-center shadow-lg", blog.thumbnailColor)}>
                                            {blog.title}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-foreground">
                                        <div className="line-clamp-1">{blog.title}</div>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-1">
                                            <Calendar size={10} /> {blog.date}
                                        </div>
                                        <div className="text-[9px] text-muted-foreground font-mono mt-0.5 truncate max-w-[200px]" title={blog.slug}>
                                            /{blog.slug}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {blog.categories.slice(0, 2).map(cat => (
                                                <Badge key={cat} variant="outline" className="text-[8px] px-1.5 py-0 bg-muted border-border">
                                                    {cat}
                                                </Badge>
                                            ))}
                                            {blog.categories.length > 2 && (
                                                <span className="text-[8px] text-muted-foreground">+{blog.categories.length - 2}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={blog.status === 'published' ? 'default' : 'secondary'} className={cn("font-black uppercase text-[9px]", blog.status === 'published' ? "bg-green-500/20 text-green-400 border-green-500/30" : "")}>
                                            {blog.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(blog)} className="hover:bg-primary/10 hover:text-primary rounded-lg transition-all">
                                            <Edit3 size={16} />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBlog(blog.id)} className="hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all">
                                            <Trash2 size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-[95vw] sm:max-w-4xl h-[calc(100dvh-2rem)] sm:h-auto sm:max-h-[85vh] bg-card border-white/10 p-0 sm:p-6 gap-0 sm:gap-4 flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
                    <DialogHeader className="p-6 sm:p-0 border-b sm:border-0 border-border">
                        <DialogTitle>{editingBlog.id ? 'Edit Blog Post' : 'New Blog Post'}</DialogTitle>
                        <DialogDescription>Share your thoughts with the world.</DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 px-6 py-4 sm:p-0 overflow-y-auto space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Title</Label>
                                <Input
                                    value={editingBlog.title || ''}
                                    onChange={e => {
                                        const newTitle = e.target.value;
                                        setEditingBlog(prev => ({
                                            ...prev,
                                            title: newTitle,
                                            // Only auto-generate slug if it's a new post or we're actively editing the title and want it linked
                                            ...(!prev.id ? { slug: newTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') } : {})
                                        }));
                                    }}
                                    placeholder="Enter blog title"
                                    className="h-12 rounded-xl bg-muted/50 border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Slug</Label>
                                <Input
                                    value={editingBlog.slug || ''}
                                    onChange={e => setEditingBlog(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                    placeholder="editable-blog-slug"
                                    className="h-12 rounded-xl bg-muted/50 border-border font-mono text-xs"
                                />
                            </div>
                            <div className="space-y-2 lg:col-span-1 md:col-span-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Date</Label>
                                <Input
                                    type="date"
                                    value={editingBlog.date || ''}
                                    onChange={e => setEditingBlog(prev => ({ ...prev, date: e.target.value }))}
                                    className="h-12 rounded-xl bg-muted/50 border-border"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                <Tag size={14} className="text-primary" />
                                Categories
                            </Label>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between h-12 rounded-xl bg-muted/50 border-border hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all font-bold group"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {editingBlog.categories && editingBlog.categories.length > 0 ? (
                                                <div className="flex gap-1.5 overflow-hidden">
                                                    {editingBlog.categories.slice(0, 2).map(cat => (
                                                        <Badge key={cat} variant="secondary" className="bg-primary/20 text-primary border-primary/20 text-[10px] whitespace-nowrap">
                                                            {cat}
                                                        </Badge>
                                                    ))}
                                                    {editingBlog.categories.length > 2 && (
                                                        <span className="text-[10px] text-muted-foreground">+{editingBlog.categories.length - 2}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground font-normal">Select categories...</span>
                                            )}
                                        </div>
                                        <ChevronDown size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[calc(100vw-3rem)] sm:w-[400px] bg-card border-white/10 rounded-2xl p-2 shadow-2xl z-50">
                                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-border mb-2">
                                        Blog Categories
                                    </div>
                                    <ScrollArea className="h-[300px] sm:h-[400px] pr-4">
                                        {categoriesData.map((group, gIdx) => (
                                            <div key={group.slug} className="mb-4 last:mb-0">
                                                <div
                                                    onClick={() => toggleCategory(group.name)}
                                                    className={cn(
                                                        "flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all mb-1",
                                                        editingBlog.categories?.includes(group.name)
                                                            ? "bg-primary/10 text-primary font-bold"
                                                            : "hover:bg-white/5 text-muted-foreground font-bold"
                                                    )}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-wider">{group.name}</span>
                                                    {editingBlog.categories?.includes(group.name) && <Check size={12} />}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-2">
                                                    {group.subcategories.map(sub => (
                                                        <div
                                                            key={sub}
                                                            onClick={() => toggleCategory(sub)}
                                                            className={cn(
                                                                "flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-all text-[11px]",
                                                                editingBlog.categories?.includes(sub)
                                                                    ? "bg-white/10 text-foreground font-bold"
                                                                    : "text-muted-foreground/70 hover:bg-white/5 hover:text-foreground"
                                                            )}
                                                        >
                                                            <span className="truncate">{sub}</span>
                                                            {editingBlog.categories?.includes(sub) && <Check size={10} className="text-primary" />}
                                                        </div>
                                                    ))}
                                                </div>
                                                {gIdx < categoriesData.length - 1 && <DropdownMenuSeparator className="bg-white/5 mt-4" />}
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/20 border-border">
                            <Switch
                                checked={editingBlog.status === 'published'}
                                onCheckedChange={(c) => setEditingBlog(prev => ({ ...prev, status: c ? 'published' : 'draft' }))}
                            />
                            <div>
                                <Label className="font-bold">Published</Label>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Visible to readers once published</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                            <div className="min-h-[300px] sm:min-h-[400px] border border-border rounded-xl overflow-hidden bg-background/50">
                                <DefaultTemplate
                                    ref={editorRef}
                                    onReady={(methods) => {
                                        if (editingBlog.description) {
                                            setTimeout(() => methods.injectHTML(editingBlog.description || ''), 100);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 sm:p-0 border-t sm:border-0 border-border gap-2 sm:gap-0 mt-auto">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 font-black uppercase tracking-tight">Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl h-12 font-black uppercase tracking-tight shadow-lg shadow-primary/20">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingBlog.id ? 'Update Post' : 'Publish Post'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
