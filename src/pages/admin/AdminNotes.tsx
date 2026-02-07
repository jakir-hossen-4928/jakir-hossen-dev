import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Save, Trash2, X, Edit, Loader2, Pin, PinOff, Tag, Maximize2, Minimize2 } from 'lucide-react';
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
        tags: [],
        isPinned: false
    });
    const [tagInput, setTagInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const editorRef = useRef<DefaultTemplateRef>(null);

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
                tags: currentNote.tags || [],
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
            tags: [],
            isPinned: false
        });
        setTagInput('');
        setIsFullscreen(false);
    };

    const openEditDialog = (note: Note) => {
        setCurrentNote(note);
        setIsDialogOpen(true);
        // Small timeout to allow dialog to render before injecting content
        setTimeout(() => {
            if (editorRef.current) {
                editorRef.current.injectMarkdown(note.content);
            }
        }, 100);
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!currentNote.tags?.includes(tagInput.trim())) {
                setCurrentNote(prev => ({
                    ...prev,
                    tags: [...(prev.tags || []), tagInput.trim()]
                }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setCurrentNote(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove)
        }));
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
                        <DialogContent className={`${isFullscreen ? 'w-screen h-screen max-w-none rounded-none m-0' : 'w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[95vh] sm:h-[90vh]'} flex flex-col p-0 gap-0 overflow-hidden border-2 border-yellow-400 dark:border-yellow-500`}>
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
                                            onReady={() => {
                                                if (currentNote.content) {
                                                    editorRef.current?.injectMarkdown(currentNote.content);
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-3 p-4 bg-yellow-50/50 dark:bg-yellow-950/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                        <div className="flex items-center gap-2 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                                            <Tag className="w-4 h-4" />
                                            <span>Tags</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {currentNote.tags?.map(tag => (
                                                <Badge key={tag} className="gap-1 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:hover:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700">
                                                    #{tag}
                                                    <X
                                                        className="w-3 h-3 cursor-pointer hover:text-red-600 transition-colors"
                                                        onClick={() => removeTag(tag)}
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                        <Input
                                            placeholder="Add tag (press Enter)"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                            className="border-2 border-yellow-400 dark:border-yellow-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/20 bg-white dark:bg-gray-950 text-sm rounded-lg px-3 py-2"
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
                                    onClick={() => openEditDialog(note)}
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
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {note.tags.slice(0, 3).map(tag => (
                                                <Badge key={tag} className="text-[10px] sm:text-xs px-2 py-0.5 h-5 sm:h-6 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                            {note.tags.length > 3 && (
                                                <Badge className="text-[10px] sm:text-xs px-2 py-0.5 h-5 sm:h-6 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700">
                                                    +{note.tags.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex justify-end pt-2 opacity-0 group-hover:opacity-100 transition-opacity border-t border-yellow-200 dark:border-yellow-800 mt-auto">
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
