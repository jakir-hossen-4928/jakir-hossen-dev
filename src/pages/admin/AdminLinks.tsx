import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Save, Trash2, X, Edit, Loader2, Folder, FolderPlus, Link2, ChevronRight, MoreVertical, ExternalLink, ArrowLeft, Download, Upload } from 'lucide-react';
import { BookmarkFolder, BookmarkLink } from '@/lib/types';
import {
    syncBookmarkFolders,
    syncBookmarkLinks,
    addBookmarkFolder,
    updateBookmarkFolder,
    deleteBookmarkFolder,
    addBookmarkLink,
    updateBookmarkLink,
    deleteBookmarkLink
} from '@/lib/syncService';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminLinks = () => {
    const [folders, setFolders] = useState<BookmarkFolder[]>([]);
    const [links, setLinks] = useState<BookmarkLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

    // Dialog states
    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [editingFolder, setEditingFolder] = useState<Partial<BookmarkFolder> | null>(null);
    const [editingLink, setEditingLink] = useState<Partial<BookmarkLink> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleExport = () => {
        try {
            let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and classified if you import it your browser. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

            const generateFolderHtml = (parentId: string | null, level: number) => {
                const indent = '    '.repeat(level);
                let folderHtml = '';

                // Add links in this folder
                const folderLinks = links.filter(l => l.folderId === parentId);
                folderLinks.forEach(link => {
                    folderHtml += `${indent}<DT><A HREF="${link.url}" ADD_DATE="${Math.floor(new Date(link.createdAt).getTime() / 1000)}">${link.title}</A>\n`;
                });

                // Add subfolders
                const subfolders = folders.filter(f => f.parentId === parentId);
                subfolders.forEach(folder => {
                    folderHtml += `${indent}<DT><H3 ADD_DATE="${Math.floor(new Date(folder.createdAt).getTime() / 1000)}" LAST_MODIFIED="${Math.floor(new Date(folder.updatedAt).getTime() / 1000)}">${folder.name}</H3>\n`;
                    folderHtml += `${indent}<DL><p>\n`;
                    folderHtml += generateFolderHtml(folder.id, level + 1);
                    folderHtml += `${indent}</DL><p>\n`;
                });

                return folderHtml;
            };

            html += generateFolderHtml(null, 1);
            html += `</DL><p>`;

            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bookmarks_${new Date().toISOString().split('T')[0]}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Bookmarks exported successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to export bookmarks");
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                const rootDl = doc.querySelector('dl');

                if (!rootDl) {
                    toast.error("Invalid bookmark file format");
                    return;
                }

                let importedCount = 0;
                let skippedCount = 0;

                // Use mutable snapshots during the async process to catch duplicates created in the same session
                let currentFolders = [...folders];
                let currentLinks = [...links];

                const processDl = async (dl: Element, parentId: string | null) => {
                    const dts = Array.from(dl.children).filter(child => child.tagName === 'DT');

                    for (const dt of dts) {
                        const h3 = dt.querySelector('h3');
                        const a = dt.querySelector('a');

                        if (h3) {
                            const name = h3.textContent?.trim() || 'Untitled Folder';
                            let folderId: string;

                            const existing = currentFolders.find(f => f.name === name && f.parentId === parentId);
                            if (existing) {
                                folderId = existing.id;
                                skippedCount++;
                            } else {
                                folderId = await addBookmarkFolder({ name, parentId });
                                const newFolder = {
                                    id: folderId,
                                    name,
                                    parentId,
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString()
                                };
                                currentFolders.push(newFolder);
                                setFolders(prev => [...prev, newFolder]);
                                importedCount++;
                            }

                            // Netscape format often has <DL> as a sibling after <DT> 
                            // OR sometimes nested inside <DT>. We'll check siblings first as it's standard.
                            let nextDl = dt.nextElementSibling;
                            if (!nextDl && dt.parentElement?.tagName === 'DT') {
                                // If inside DT, check parent's sibling
                                nextDl = dt.parentElement.nextElementSibling;
                            }

                            // Check if next element is a DL (standard hierarchy)
                            if (nextDl && nextDl.tagName === 'DL') {
                                await processDl(nextDl, folderId);
                            } else {
                                // Some exporters put DL inside DT
                                const innerDl = dt.querySelector('dl');
                                if (innerDl) await processDl(innerDl, folderId);
                            }
                        } else if (a) {
                            const title = a.textContent?.trim() || 'Untitled Link';
                            const url = a.getAttribute('href') || '';
                            if (!url) continue;

                            const isDuplicate = currentLinks.some(l => l.url === url && l.folderId === parentId);
                            if (isDuplicate) {
                                skippedCount++;
                            } else {
                                const id = await addBookmarkLink({ title, url, folderId: parentId });
                                const newLink = {
                                    id,
                                    title,
                                    url,
                                    folderId: parentId,
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString()
                                };
                                currentLinks.push(newLink);
                                setLinks(prev => [...prev, newLink]);
                                importedCount++;
                            }
                        }
                    }
                };

                await processDl(rootDl, currentFolderId);
                toast.success(`Import complete: ${importedCount} added, ${skippedCount} skipped`);
            } catch (error) {
                console.error("Import error:", error);
                toast.error("Failed to parse bookmark file");
            } finally {
                setIsSaving(false);
                if (e.target) e.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fetchedFolders, fetchedLinks] = await Promise.all([
                    syncBookmarkFolders(),
                    syncBookmarkLinks()
                ]);
                setFolders(fetchedFolders);
                setLinks(fetchedLinks);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load bookmarks");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCreateOrUpdateFolder = async () => {
        if (!editingFolder?.name) {
            toast.error("Folder name is required");
            return;
        }

        setIsSaving(true);
        try {
            if (editingFolder.id) {
                await updateBookmarkFolder(editingFolder.id, { name: editingFolder.name });
                setFolders(prev => prev.map(f => f.id === editingFolder.id ? { ...f, name: editingFolder.name! } : f));
                toast.success("Folder updated");
            } else {
                const id = await addBookmarkFolder({
                    name: editingFolder.name,
                    parentId: currentFolderId
                });
                const newFolder = {
                    id,
                    name: editingFolder.name,
                    parentId: currentFolderId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                setFolders(prev => [newFolder, ...prev]);
                toast.success("Folder created");
            }
            setIsFolderDialogOpen(false);
            setEditingFolder(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save folder");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateOrUpdateLink = async () => {
        if (!editingLink?.title || !editingLink?.url) {
            toast.error("Title and URL are required");
            return;
        }

        setIsSaving(true);
        try {
            if (editingLink.id) {
                await updateBookmarkLink(editingLink.id, { title: editingLink.title, url: editingLink.url });
                setLinks(prev => prev.map(l => l.id === editingLink.id ? { ...l, title: editingLink.title!, url: editingLink.url! } : l));
                toast.success("Link updated");
            } else {
                const id = await addBookmarkLink({
                    title: editingLink.title,
                    url: editingLink.url,
                    folderId: currentFolderId
                });
                const newLink = {
                    id,
                    title: editingLink.title,
                    url: editingLink.url,
                    folderId: currentFolderId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                setLinks(prev => [newLink, ...prev]);
                toast.success("Link created");
            }
            setIsLinkDialogOpen(false);
            setEditingLink(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save link");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteFolder = async (id: string) => {
        if (confirm("Delete this folder and all its sub-items?")) {
            try {
                await deleteBookmarkFolder(id);

                // Recursively find all child IDs to remove from state
                const getChildIds = (parentId: string): string[] => {
                    const children = folders.filter(f => f.parentId === parentId);
                    return [parentId, ...children.flatMap(c => getChildIds(c.id))];
                };

                const allIdsToDelete = getChildIds(id);

                setFolders(prev => prev.filter(f => !allIdsToDelete.includes(f.id)));
                setLinks(prev => prev.filter(l => !allIdsToDelete.includes(l.folderId || '')));

                toast.success("Folder and all sub-items deleted");
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete folder");
            }
        }
    };

    const handleDeleteLink = async (id: string) => {
        if (confirm("Delete this link?")) {
            try {
                await deleteBookmarkLink(id);
                setLinks(prev => prev.filter(l => l.id !== id));
                toast.success("Link deleted");
            } catch (error) {
                toast.error("Failed to delete link");
            }
        }
    };

    const currentPath = React.useMemo(() => {
        const path: BookmarkFolder[] = [];
        let folderId = currentFolderId;
        while (folderId) {
            const folder = folders.find(f => f.id === folderId);
            if (folder) {
                path.unshift(folder);
                folderId = folder.parentId;
            } else {
                break;
            }
        }
        return path;
    }, [currentFolderId, folders]);

    const filteredFolders = folders.filter(f => f.parentId === currentFolderId && f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredLinks = links.filter(l => l.folderId === currentFolderId && (l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.url.toLowerCase().includes(searchQuery.toLowerCase())));

    // Favicon helper component
    const Favicon = ({ url, title }: { url: string, title: string }) => {
        const [error, setError] = React.useState(false);

        // Extract domain for the favicon service
        const domain = React.useMemo(() => {
            try {
                return new URL(url).hostname;
            } catch (e) {
                return '';
            }
        }, [url]);

        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

        if (error || !domain) {
            return (
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Link2 className="w-6 h-6" />
                </div>
            );
        }

        return (
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:bg-white/10 transition-colors overflow-hidden">
                <img
                    src={faviconUrl}
                    alt={title}
                    className="w-full h-full object-contain"
                    onError={() => setError(true)}
                />
            </div>
        );
    };

    return (
        <div className="space-y-6 p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">🔗 Link Manager</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">Organize your resources in folders.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-card/50"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleExport}
                        title="Export Bookmarks"
                        className="bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20"
                    >
                        <Download className="w-4 h-4 text-emerald-500" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => document.getElementById('bookmark-import')?.click()}
                        title="Import Bookmarks"
                        className="bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20"
                    >
                        <Upload className="w-4 h-4 text-blue-500" />
                    </Button>
                    <input
                        id="bookmark-import"
                        type="file"
                        accept=".html"
                        className="hidden"
                        onChange={handleImport}
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            setEditingFolder({ name: '' });
                            setIsFolderDialogOpen(true);
                        }}
                        className="bg-primary/5 hover:bg-primary/10 border-primary/20"
                    >
                        <FolderPlus className="w-4 h-4 text-primary" />
                    </Button>
                    <Button
                        onClick={() => {
                            setEditingLink({ title: '', url: '' });
                            setIsLinkDialogOpen(true);
                        }}
                        className="gap-2 font-bold shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Link</span><span className="sm:hidden">Add</span>
                    </Button>
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 px-4 py-2 bg-card/30 backdrop-blur-md rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentFolderId(null)}
                    className={`gap-2 h-8 ${!currentFolderId ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground'}`}
                >
                    <Folder className="w-4 h-4" />
                    Root
                </Button>
                {currentPath.map((folder, idx) => (
                    <React.Fragment key={folder.id}>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentFolderId(folder.id)}
                            className={`h-8 ${idx === currentPath.length - 1 ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground'}`}
                        >
                            {folder.name}
                        </Button>
                    </React.Fragment>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence mode="popLayout">
                        {/* Go Back button if in a folder */}
                        {currentFolderId && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <Card
                                    className="group hover:shadow-xl transition-all cursor-pointer border-dashed border-primary/20 bg-primary/5 h-[120px] flex items-center justify-center"
                                    onClick={() => {
                                        const parentFolder = currentPath[currentPath.length - 2];
                                        setCurrentFolderId(parentFolder ? parentFolder.id : null);
                                    }}
                                >
                                    <div className="text-center">
                                        <ArrowLeft className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors mx-auto mb-2" />
                                        <span className="text-sm font-bold text-primary/40 group-hover:text-primary transition-colors">Go Back</span>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Persistent Creation Cards */}
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card
                                className="group hover:shadow-xl transition-all cursor-pointer border-dashed border-primary/40 bg-primary/5 h-[120px] flex items-center justify-center hover:bg-primary/10"
                                onClick={() => {
                                    setEditingFolder({ name: '' });
                                    setIsFolderDialogOpen(true);
                                }}
                            >
                                <div className="text-center">
                                    <FolderPlus className="w-8 h-8 text-primary/50 group-hover:text-primary transition-colors mx-auto mb-2" />
                                    <span className="text-sm font-bold text-primary/50 group-hover:text-primary transition-colors">New Folder</span>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card
                                className="group hover:shadow-xl transition-all cursor-pointer border-dashed border-blue-500/40 bg-blue-500/5 h-[120px] flex items-center justify-center hover:bg-blue-500/10"
                                onClick={() => {
                                    setEditingLink({ title: '', url: '' });
                                    setIsLinkDialogOpen(true);
                                }}
                            >
                                <div className="text-center">
                                    <Plus className="w-8 h-8 text-blue-500/50 group-hover:text-blue-500 transition-colors mx-auto mb-2" />
                                    <span className="text-sm font-bold text-blue-500/50 group-hover:text-blue-500 transition-colors">Add Link</span>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Folder List */}
                        {filteredFolders.map((folder) => (
                            <motion.div
                                key={folder.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card
                                    className="group hover:shadow-xl transition-all border-white/5 bg-card/50 cursor-pointer h-[120px] relative flex flex-col justify-center overflow-hidden"
                                    onClick={() => setCurrentFolderId(folder.id)}
                                >
                                    <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingFolder(folder);
                                                    setIsFolderDialogOpen(true);
                                                }}>
                                                    <Edit className="w-4 h-4 mr-2" /> Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteFolder(folder.id);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="p-4 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Folder className="w-6 h-6 fill-current opacity-20" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold truncate group-hover:text-primary transition-colors">{folder.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {folders.filter(f => f.parentId === folder.id).length} folders, {links.filter(l => l.folderId === folder.id).length} links
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}

                        {/* Link List */}
                        {filteredLinks.map((link) => (
                            <motion.div
                                key={link.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card
                                    className="group hover:shadow-xl transition-all border-white/5 bg-card/50 cursor-pointer h-[120px] relative flex flex-col justify-center overflow-hidden"
                                    onClick={() => window.open(link.url, '_blank')}
                                >
                                    <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingLink(link);
                                                    setIsLinkDialogOpen(true);
                                                }}>
                                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteLink(link.id);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="p-4 flex items-center gap-4">
                                        <Favicon url={link.url} title={link.title} />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold truncate group-hover:text-blue-500 transition-colors">{link.title}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{link.url.replace(/^https?:\/\//, '')}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!loading && filteredFolders.length === 0 && filteredLinks.length === 0 && searchQuery && (
                <div className="text-center py-20 px-4 bg-card/20 rounded-3xl border border-dashed border-white/10">
                    <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-lg font-bold">No results found</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        We couldn't find anything matching your search query.
                    </p>
                </div>
            )}

            {/* Folder Dialog */}
            <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFolder?.id ? 'Rename Folder' : 'New Folder'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Folder Name"
                            value={editingFolder?.name || ''}
                            onChange={(e) => setEditingFolder(prev => ({ ...prev, name: e.target.value }))}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsFolderDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateOrUpdateFolder} disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingFolder?.id ? 'Rename' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Link Dialog */}
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingLink?.id ? 'Edit Link' : 'Add Link'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                placeholder="Link Title"
                                value={editingLink?.title || ''}
                                onChange={(e) => setEditingLink(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">URL</label>
                            <Input
                                placeholder="https://..."
                                value={editingLink?.url || ''}
                                onChange={(e) => setEditingLink(prev => ({ ...prev, url: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsLinkDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateOrUpdateLink} disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingLink?.id ? 'Save' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminLinks;
