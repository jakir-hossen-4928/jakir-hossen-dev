import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Save, Trash2, X, Edit, Loader2, Pin, PinOff, Maximize2, Minimize2 } from 'lucide-react';
import { Note } from '@/lib/types';
import { syncNotes, subscribeToNotes, addNote, updateNote, deleteNote } from '@/lib/syncService';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DefaultTemplate, DefaultTemplateRef } from '@/richtexteditor/DefaultTemplate';

const AdminNotes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState<Partial<Note>>({
        title: '',
        content: '',
        isPinned: false
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const editorRef = useRef<DefaultTemplateRef>(null);
    const viewEditorRef = useRef<DefaultTemplateRef>(null);

    // View Modal State
    const [viewNote, setViewNote] = useState<Note | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const initialNotes = await syncNotes();
                setNotes(initialNotes);
            } catch (error) {
                console.error("Failed to fetch notes:", error);
                toast.error("Failed to load notes");
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();

        const unsubscribe = subscribeToNotes((updatedNotes) => {
            setNotes(updatedNotes);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateOrUpdate = async () => {
        if (!currentNote.title) {
            toast.error("Title is required");
            return;
        }

        setIsSaving(true);
        try {
            // Get content from editor
            const content = editorRef.current?.getMarkdown() || currentNote.content || '';

            const noteData = {
                ...currentNote,
                content: content,
                isPinned: currentNote.isPinned || false
            };

            if (currentNote.id) {
                await updateNote(currentNote.id, noteData);
                toast.success("Note updated successfully");
            } else {
                await addNote(noteData as Omit<Note, 'id' | 'createdAt' | 'updatedAt'>);
                toast.success("Note created successfully");
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error saving note:", error);
            toast.error("Failed to save note");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this note?")) {
            try {
                await deleteNote(id);
                toast.success("Note deleted");
            } catch (error) {
                console.error("Error deleting note:", error);
                toast.error("Failed to delete note");
            }
        }
    };

    const handlePinToggle = async (note: Note, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await updateNote(note.id, { isPinned: !note.isPinned });
            toast.success(note.isPinned ? "Note unpinned" : "Note pinned");
        } catch (error) {
            console.error("Error updating pin status:", error);
            toast.error("Failed to update note");
        }
    };

    const resetForm = () => {
        setCurrentNote({
            title: '',
            content: '',
            isPinned: false
        });
        setIsFullscreen(false);
    };

    const openViewDialog = (note: Note) => {
        console.debug("[AdminNotes] Opening view dialog for note:", note.id);
        setViewNote(note);
        setIsViewDialogOpen(true);
        // Backup injection
        setTimeout(() => {
            if (viewEditorRef.current) {
                console.debug("[AdminNotes] Backup injection for View dialog");
                viewEditorRef.current.injectMarkdown(note.content);
            }
        }, 200);
    };

    const openEditDialog = (note: Note) => {
        console.debug("[AdminNotes] Opening edit dialog for note:", note.id);
        setCurrentNote(note);
        setIsDialogOpen(true);
        // Backup injection
        setTimeout(() => {
            if (editorRef.current) {
                console.debug("[AdminNotes] Backup injection for Edit dialog");
                editorRef.current.injectMarkdown(note.content);
            }
        }, 200);
    };



    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        if (a.isPinned === b.isPinned) {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        return a.isPinned ? -1 : 1;
    });

    return (
        <div className="space-y-6 p-3 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">📔 Notebook</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">Capture your thoughts and ideas.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-card/50 backdrop-blur-sm border-border focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 font-bold shadow-lg shadow-yellow-500/20 bg-yellow-500 hover:bg-yellow-600 text-white min-h-[44px] px-4">
                                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Note</span><span className="sm:hidden">New</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className={`${isFullscreen ? 'w-screen h-screen max-w-none rounded-none m-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]' : 'w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[95vh] sm:h-[90vh]'} flex flex-col p-0 gap-0 overflow-hidden border-2 border-yellow-400 dark:border-yellow-500`}>
                            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-yellow-400/30 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 sticky top-0 z-10">
                                <DialogHeader className="p-0 space-y-0">
                                    <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <span className="text-yellow-600 dark:text-yellow-400">✏️</span>
                                        {currentNote.id ? 'Edit Note' : 'Create Note'}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                                        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                                    >
                                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(false)} className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Note Title"
                                        value={currentNote.title}
                                        onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                                        className="text-lg sm:text-xl font-bold border-2 border-yellow-400 dark:border-yellow-500 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-500 placeholder:text-muted-foreground/50"
                                    />

                                    <div className="min-h-[300px] sm:min-h-[400px] rounded-lg overflow-hidden relative border-2 border-yellow-400 dark:border-yellow-500 shadow-lg shadow-yellow-400/10">
                                        <DefaultTemplate
                                            ref={editorRef}
                                            className="h-full min-h-[300px] sm:min-h-[400px]"
                                            onChange={(markdown) => setCurrentNote(prev => ({ ...prev, content: markdown }))}
                                            onReady={(methods) => {
                                                console.debug("[AdminNotes] Edit editor ready, content available:", !!currentNote.content);
                                                if (currentNote.content) {
                                                    methods.injectMarkdown(currentNote.content);
                                                }
                                            }}
                                        />
                                    </div>


                                </div>
                            </div>

                            <div className="p-4 sm:p-6 border-t border-yellow-400/30 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 flex justify-end gap-2 sticky bottom-0">
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="min-h-[44px] hover:bg-yellow-100 dark:hover:bg-yellow-900/30">Cancel</Button>
                                <Button onClick={handleCreateOrUpdate} disabled={isSaving} className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white min-h-[44px] shadow-lg shadow-yellow-500/20">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Note
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* View Note Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-2 border-yellow-400 dark:border-yellow-500">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-yellow-400/30 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 sticky top-0 z-10">
                        <DialogHeader className="p-0 space-y-0">
                            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                                <span className="text-yellow-600 dark:text-yellow-400">📖</span>
                                {viewNote?.title}
                            </DialogTitle>
                        </DialogHeader>
                        <Button variant="ghost" size="icon" onClick={() => setIsViewDialogOpen(false)} className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="min-h-[300px] sm:min-h-[400px] rounded-lg overflow-hidden relative border-2 border-yellow-400/50 dark:border-yellow-500/50 shadow-sm">
                            <DefaultTemplate
                                ref={viewEditorRef}
                                className="h-full min-h-[300px] sm:min-h-[400px]"
                                readOnly={true}
                                onReady={(methods) => {
                                    console.debug("[AdminNotes] View editor ready, content available:", !!viewNote?.content);
                                    if (viewNote?.content) {
                                        methods.injectMarkdown(viewNote.content);
                                    }
                                }}
                            />
                        </div>


                    </div>

                    {/* Footer with Edit Button */}
                    <div className="p-4 sm:p-6 border-t border-yellow-400/30 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 flex justify-end gap-2 sticky bottom-0">
                        <Button
                            onClick={() => {
                                setIsViewDialogOpen(false);
                                if (viewNote) openEditDialog(viewNote);
                            }}
                            className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white min-h-[44px] shadow-lg shadow-yellow-500/20"
                        >
                            <Edit className="w-4 h-4" /> Edit Note
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className="text-center py-20 px-4">
                    <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Edit className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-bold">No notes found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                        {searchQuery ? "Try a different search term" : "Create your first note to get started"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <AnimatePresence>
                        {filteredNotes.map((note) => (
                            <motion.div
                                key={note.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card
                                    className="group hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-500 cursor-pointer h-full flex flex-col hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={() => openViewDialog(note)}
                                >
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                        <div className="space-y-1 pr-8">
                                            <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                                            <CardDescription className="text-xs">
                                                {new Date(note.updatedAt).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-9 w-9 sm:h-10 sm:w-10 -mt-1 -mr-2 opacity-0 group-hover:opacity-100 transition-all min-h-[44px] sm:min-h-0 ${note.isPinned ? 'opacity-100 text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`}
                                            onClick={(e) => handlePinToggle(note, e)}
                                        >
                                            {note.isPinned ? <PinOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Pin className="w-4 h-4 sm:w-5 sm:h-5" />}
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4 flex-1 flex flex-col">
                                        <p className="text-sm text-muted-foreground line-clamp-4 flex-1 whitespace-pre-line">
                                            {note.content}
                                        </p>

                                        <div className="flex justify-end pt-2 opacity-0 group-hover:opacity-100 transition-opacity border-t border-yellow-200 dark:border-yellow-800 mt-auto gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 sm:h-8 min-h-[44px] sm:min-h-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900/30"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditDialog(note);
                                                }}
                                            >
                                                <Edit className="w-4 h-4 sm:w-3.5 sm:h-3.5 mr-1.5" />
                                                <span className="text-sm">Edit</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 sm:h-8 min-h-[44px] sm:min-h-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={(e) => handleDelete(note.id, e)}
                                            >
                                                <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 mr-1.5" />
                                                <span className="text-sm">Delete</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AdminNotes;
