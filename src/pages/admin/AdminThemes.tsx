import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';
import { confirmToast } from '@/components/ui/ConfirmToast';
import { Search, Plus, Trash2, Edit3, Loader2, UploadCloud, Layout } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { db as firestore } from '@/lib/firebase';
import { doc, setDoc, collection, writeBatch } from 'firebase/firestore';
import { uploadToImgBB } from '@/lib/imgbb';
import { WebTheme } from '@/lib/types';
import { useWebThemes, useThemeCategories, useThemeMutations } from '@/hooks/useWebThemes';
import { cn } from '@/lib/utils';
import { THEME_CATEGORIES } from '@/lib/constants';

export const AdminThemes: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { themes, isLoading: themesLoading } = useWebThemes();
    const { categories } = useThemeCategories();
    const { createTheme, updateTheme, deleteTheme, isCreating, isUpdating, isDeleting } = useThemeMutations();
    const location = useLocation();
    const navigate = useNavigate();

    // Simple local filtering for search
    const filteredThemes = useMemo(() => {
        if (!searchTerm.trim()) return themes;
        const query = searchTerm.toLowerCase();
        return themes.filter(theme => 
            theme.name.toLowerCase().includes(query) ||
            theme.category.toLowerCase().includes(query)
        );
    }, [themes, searchTerm]);

    // Debug log
    useEffect(() => {
        console.log('[AdminThemes] themes:', themes.length, 'filtered:', filteredThemes.length, 'loading:', themesLoading);
    }, [themes, filteredThemes, themesLoading]);

    // Virtualization setup for large theme lists
    const tableParentRef = useRef<HTMLDivElement>(null);
    
    const virtualizer = useVirtualizer({
        count: filteredThemes.length,
        getScrollElement: () => tableParentRef.current,
        estimateSize: () => 73,
        overscan: 5,
    });
    
    const virtualItems = virtualizer.getVirtualItems();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTheme, setEditingTheme] = useState<Partial<WebTheme>>({});
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Combined loading state
    const isSaving = isCreating || isUpdating;

    // Deep link handling
    useEffect(() => {
        if (!themesLoading && themes.length > 0) {
            const params = new URLSearchParams(location.search);
            const editThemeId = params.get('editTheme');
            if (editThemeId) {
                const themeToEdit = themes.find(t => t.id === editThemeId);
                if (themeToEdit && !isDialogOpen) {
                    setEditingTheme({ ...themeToEdit });
                    setIsDialogOpen(true);
                }
            }
        }
    }, [location.search, themes, themesLoading, isDialogOpen]);

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            const params = new URLSearchParams(location.search);
            if (params.has('editTheme')) {
                params.delete('editTheme');
                navigate({ search: params.toString() }, { replace: true });
            }
        }
    };

    const handleOpenDialog = (theme?: WebTheme) => {
        if (theme) {
            setEditingTheme({ ...theme });
        } else {
            setEditingTheme({
                id: '',
                name: '',
                tagline: '',
                description: '',
                category: categories[0]?.id || 'organic',
                tags: [],
                features: [],
                bestFor: [],
                complexity: 'medium',
                popularity: 80,
                colorPalette: {
                    primary: '#000000',
                    secondary: '#333333',
                    accent: '#666666',
                    background: '#FFFFFF',
                    text: '#000000'
                },
                typography: { heading: 'Archivo', body: 'Space Grotesk' },
                pricing: { tier: 'Standard', basePrice: 99, currency: 'USD' },
                meetingBooking: {
                    enabled: true,
                    calendlyLink: '',
                    duration: 30,
                    requiresDeposit: false,
                    depositAmount: 0
                }
            });
        }
        setIsDialogOpen(true);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'previewUrl') => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(field);
        try {
            const url = await uploadToImgBB(file);
            setEditingTheme(prev => ({ ...prev, [field]: url }));
            toast.success(`${field === 'imageUrl' ? 'Thumbnail' : 'Preview'} uploaded successfully`);
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(null);
        }
    };

    const handleSave = async () => {
        if (!editingTheme.name) {
            toast.error("Theme Name is required");
            return;
        }

        try {
            const themeId = editingTheme.id || editingTheme.name.toLowerCase().replace(/\s+/g, '-');

            const themeData = {
                ...editingTheme,
                id: themeId,
                description: editingTheme.description || '',
                updatedAt: new Date().toISOString(),
                createdAt: editingTheme.createdAt || new Date().toISOString(),
            } as WebTheme;

            if (editingTheme.id) {
                // Update existing theme
                await updateTheme({ id: themeId, updates: themeData });
                toast.success("Theme updated");
            } else {
                // Create new theme
                await createTheme(themeData);
                toast.success("Theme created");
            }
            handleDialogChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Error saving theme");
        }
    };

    const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                const themesToUpload = Array.isArray(json) ? json : (json.themes || (json.portfolio ? json.portfolio.themes : []));
                
                if (themesToUpload.length === 0) {
                    toast.error("No themes found in JSON");
                    return;
                }

                // Process themes sequentially to use mutation hooks
                let successCount = 0;
                for (const theme of themesToUpload) {
                    try {
                        const themeId = theme.id || theme.name.toLowerCase().replace(/\s+/g, '-');
                        const themeData = {
                            ...theme,
                            id: themeId,
                            createdAt: theme.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        
                        if (theme.id) {
                            await updateTheme({ id: themeId, updates: themeData });
                        } else {
                            await createTheme(themeData);
                        }
                        successCount++;
                    } catch (err) {
                        console.error(`Failed to upload theme:`, err);
                    }
                }

                toast.success(`Successfully uploaded ${successCount}/${themesToUpload.length} themes`);
            } catch (error) {
                console.error("Bulk upload error:", error);
                toast.error("Failed to parse or upload JSON");
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleDeleteTheme = async (themeId: string) => {
        confirmToast("Delete this theme?", async () => {
            try {
                await deleteTheme(themeId);
                toast.success("Theme deleted");
            } catch (error) {
                console.error("Error deleting theme:", error);
                toast.error("Failed to delete");
            }
        });
    };

    return (
        <Card className="border border-border rounded-2xl overflow-hidden bg-card/30 backdrop-blur-xl">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between bg-white/[0.02] border-b border-border p-6 md:p-8 gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto">
                    <div>
                        <CardTitle className="text-xl font-black text-foreground">Theme Manager</CardTitle>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Manage {themes.length} Visual Themes</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search themes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10 rounded-xl bg-muted/50 border-border text-xs font-bold focus-visible:ring-primary/20"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleBulkUpload} 
                        accept=".json" 
                        className="hidden" 
                    />
                    <Button 
                        onClick={() => fileInputRef.current?.click()} 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl h-10 font-bold text-[10px] uppercase tracking-wider border-dashed"
                    >
                        <UploadCloud size={14} className="mr-2" /> Bulk Import
                    </Button>
                    <Button onClick={() => handleOpenDialog()} size="sm" className="rounded-xl h-10 font-black uppercase tracking-tight bg-primary hover:bg-primary/90 flex-1 md:flex-none">
                        <Plus size={14} className="mr-2" /> Add Theme
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-white/[0.01]">
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="w-[100px] pl-6 text-[10px] font-black uppercase tracking-widest">Image</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Theme Details</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Category</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Pricing</TableHead>
                            <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
                {/* Table Body */}
                <div 
                    ref={tableParentRef}
                    className="overflow-auto"
                    style={{ height: '600px', position: 'relative' }}
                >
                    {(() => {
                        console.log('[AdminThemes Render] loading:', themesLoading, 'filtered:', filteredThemes.length, 'virtualItems:', virtualItems.length, 'totalSize:', virtualizer.getTotalSize());
                        return null;
                    })()}
                    {themesLoading ? (
                        <Table>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-border">
                                        <TableCell className="pl-6 py-4"><Skeleton className="w-16 h-12 rounded-lg" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-40 mb-2" /><Skeleton className="h-3 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell className="text-right pr-6"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : filteredThemes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <p className="text-lg font-medium">No themes found</p>
                            <p className="text-sm">{searchTerm ? 'Try adjusting your search' : 'Add your first theme to get started'}</p>
                        </div>
                    ) : (
                        <div
                            style={{
                                height: `${virtualizer.getTotalSize()}px`,
                                width: '100%',
                                position: 'relative',
                            }}
                        >
                            {(() => {
                                console.log('[AdminThemes Render] rendering themes, virtualItems:', virtualItems.length);
                                return null;
                            })()}
                            {virtualItems.length === 0 ? (
                                // Fallback: render all items if virtualizer fails
                                <Table>
                                    <TableBody>
                                        {(() => {
                                            console.log('[AdminThemes Render] Using fallback rendering for', filteredThemes.length, 'themes');
                                            return null;
                                        })()}
                                        {filteredThemes.map((theme) => (
                                            <TableRow 
                                                key={theme.id} 
                                                className="border-border hover:bg-white/[0.02] transition-colors group text-sm"
                                            >
                                                <TableCell className="pl-6 py-4">
                                                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted border border-border">
                                                        {theme.imageUrl ? (
                                                            <img src={theme.imageUrl} alt={theme.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Layout className="w-full h-full p-3 text-muted-foreground/30" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-foreground">
                                                    <div className="flex flex-col">
                                                        <span>{theme.name}</span>
                                                        <span className="text-[10px] text-muted-foreground font-normal">{theme.tagline}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wider">{theme.category}</Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-primary font-bold">
                                                    {theme.pricing.currency === 'USD' ? '$' : theme.pricing.currency}{theme.pricing.basePrice}
                                                </TableCell>
                                                <TableCell className="text-right pr-6 space-x-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(theme)} className="hover:bg-primary/10 hover:text-primary rounded-lg transition-all">
                                                        <Edit3 size={16} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTheme(theme.id)} className="hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="w-full">
                                    {(() => {
                                        console.log('[AdminThemes Render] Using virtualized rendering for', virtualItems.length, 'items');
                                        return null;
                                    })()}
                                    {virtualItems.map((virtualRow) => {
                                        const theme = filteredThemes[virtualRow.index];
                                        if (!theme) return null;
                                        return (
                                            <div 
                                                key={theme.id} 
                                                className="flex items-center border-b border-border hover:bg-white/[0.02] transition-colors group text-sm px-6"
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    transform: `translateY(${virtualRow.start}px)`,
                                                    height: `${virtualRow.size}px`,
                                                }}
                                                data-index={virtualRow.index}
                                            >
                                                <div className="w-[100px] py-4">
                                                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted border border-border">
                                                        {theme.imageUrl ? (
                                                            <img src={theme.imageUrl} alt={theme.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Layout className="w-full h-full p-3 text-muted-foreground/30" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1 font-bold text-foreground">
                                                    <div className="flex flex-col">
                                                        <span>{theme.name}</span>
                                                        <span className="text-[10px] text-muted-foreground font-normal">{theme.tagline}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wider">{theme.category}</Badge>
                                                </div>
                                                <div className="flex-1 font-mono text-primary font-bold">
                                                    {theme.pricing.currency === 'USD' ? '$' : theme.pricing.currency}{theme.pricing.basePrice}
                                                </div>
                                                <div className="text-right space-x-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(theme)} className="hover:bg-primary/10 hover:text-primary rounded-lg transition-all">
                                                        <Edit3 size={16} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTheme(theme.id)} className="hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-card border-white/10 custom-scrollbar">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{editingTheme.id ? 'Edit Theme' : 'Create New Theme'}</DialogTitle>
                        <DialogDescription>Configure your web theme aesthetics and pricing details.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                        {/* Left Column: Core Data */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-primary">Core Details</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase">Theme ID (Unique)</Label>
                                        <Input
                                            value={editingTheme.id || ''}
                                            onChange={e => setEditingTheme(prev => ({ ...prev, id: e.target.value }))}
                                            placeholder="e.g. botanical"
                                            className="rounded-xl bg-muted/30 border-border"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase">Theme Name</Label>
                                        <Input
                                            value={editingTheme.name || ''}
                                            onChange={e => setEditingTheme(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g. Botanical"
                                            className="rounded-xl bg-muted/30 border-border"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase">Tagline</Label>
                                    <Input
                                        value={editingTheme.tagline || ''}
                                        onChange={e => setEditingTheme(prev => ({ ...prev, tagline: e.target.value }))}
                                        placeholder="Nature-inspired organic elegance"
                                        className="rounded-xl bg-muted/30 border-border"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase">Category (Slug)</Label>
                                        <select
                                            value={editingTheme.category || ''}
                                            onChange={e => setEditingTheme(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full h-10 px-3 rounded-xl bg-muted/30 border border-border text-sm outline-none focus:ring-1 focus:ring-primary/20"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase">Complexity (low/medium/high)</Label>
                                        <Input
                                            value={editingTheme.complexity || ''}
                                            onChange={e => setEditingTheme(prev => ({ ...prev, complexity: e.target.value as any }))}
                                            placeholder="medium"
                                            className="rounded-xl bg-muted/30 border-border"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase">Tags (Comma separated)</Label>
                                    <Input
                                        value={editingTheme.tags?.join(', ') || ''}
                                        onChange={e => setEditingTheme(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                                        placeholder="nature, organic, green"
                                        className="rounded-xl bg-muted/30 border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase">Popularity Score (0-100)</Label>
                                    <Input
                                        type="number"
                                        value={editingTheme.popularity || 0}
                                        onChange={e => setEditingTheme(prev => ({ ...prev, popularity: parseInt(e.target.value) || 0 }))}
                                        className="rounded-xl bg-muted/30 border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase">Description</Label>
                                    <textarea
                                        value={editingTheme.description || ''}
                                        onChange={e => setEditingTheme(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Enter your theme description here..."
                                        className="w-full min-h-[120px] p-3 rounded-xl bg-muted/30 border border-border focus:ring-1 focus:ring-primary/20 outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-primary">Aesthetics</Label>
                                <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['primary', 'secondary', 'accent', 'background', 'text'] as const).map(color => (
                                            <div key={color} className="space-y-1">
                                                <Label className="text-[9px] font-bold uppercase">{color}</Label>
                                                <div className="flex items-center gap-1.5">
                                                    <Input
                                                        type="color"
                                                        value={editingTheme.colorPalette?.[color] || '#000000'}
                                                        onChange={e => setEditingTheme(prev => ({
                                                            ...prev,
                                                            colorPalette: {
                                                                ...(prev.colorPalette || {
                                                                    primary: '#000000',
                                                                    secondary: '#333333',
                                                                    accent: '#666666',
                                                                    background: '#FFFFFF',
                                                                    text: '#000000'
                                                                }),
                                                                [color]: e.target.value
                                                            }
                                                        }))}
                                                        className="w-7 h-7 p-0 rounded-md border-border cursor-pointer"
                                                    />
                                                    <span className="text-[9px] font-mono">{editingTheme.colorPalette?.[color]}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-bold uppercase">Heading Font</Label>
                                            <Input
                                                value={editingTheme.typography?.heading || ''}
                                                onChange={e => setEditingTheme(prev => ({
                                                    ...prev,
                                                    typography: {
                                                        heading: e.target.value,
                                                        body: prev.typography?.body || 'Space Grotesk'
                                                    }
                                                }))}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-bold uppercase">Body Font</Label>
                                            <Input
                                                value={editingTheme.typography?.body || ''}
                                                onChange={e => setEditingTheme(prev => ({
                                                    ...prev,
                                                    typography: {
                                                        heading: prev.typography?.heading || 'Archivo',
                                                        body: e.target.value
                                                    }
                                                }))}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Interactive Data */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-primary">Visuals</Label>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase">Thumbnail Image URL</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={editingTheme.imageUrl || ''}
                                                onChange={e => setEditingTheme(prev => ({ ...prev, imageUrl: e.target.value }))}
                                                placeholder="https://..."
                                                className="flex-1 text-xs"
                                            />
                                            <Button size="icon" variant="outline" className="shrink-0 relative">
                                                <UploadCloud size={14} />
                                                <input type="file" onChange={e => handleFileUpload(e, 'imageUrl')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase">Full Preview URL</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={editingTheme.previewUrl || ''}
                                                onChange={e => setEditingTheme(prev => ({ ...prev, previewUrl: e.target.value }))}
                                                placeholder="https://..."
                                                className="flex-1 text-xs"
                                            />
                                            <Button size="icon" variant="outline" className="shrink-0 relative">
                                                <UploadCloud size={14} />
                                                <input type="file" onChange={e => handleFileUpload(e, 'previewUrl')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-primary">Lists (One per line)</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase">Key Features</Label>
                                        <textarea
                                            value={editingTheme.features?.join('\n') || ''}
                                            onChange={e => setEditingTheme(prev => ({ ...prev, features: e.target.value.split('\n').filter(l => l.trim()) }))}
                                            placeholder="List features..."
                                            className="w-full min-h-[100px] p-2 text-xs rounded-xl bg-muted/30 border border-border"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase">Best For</Label>
                                        <textarea
                                            value={editingTheme.bestFor?.join('\n') || ''}
                                            onChange={e => setEditingTheme(prev => ({ ...prev, bestFor: e.target.value.split('\n').filter(l => l.trim()) }))}
                                            placeholder="List use cases..."
                                            className="w-full min-h-[100px] p-2 text-xs rounded-xl bg-muted/30 border border-border"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-primary">Business & Booking</Label>
                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-bold uppercase">Tier</Label>
                                            <Input
                                                value={editingTheme.pricing?.tier || ''}
                                                onChange={e => setEditingTheme(prev => ({
                                                    ...prev,
                                                    pricing: {
                                                        ...(prev.pricing || { tier: 'Standard', basePrice: 99, currency: 'USD' }),
                                                        tier: e.target.value
                                                    }
                                                }))}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-bold uppercase">Base Price</Label>
                                            <Input
                                                type="number"
                                                value={editingTheme.pricing?.basePrice}
                                                onChange={e => setEditingTheme(prev => ({
                                                    ...prev,
                                                    pricing: {
                                                        ...(prev.pricing || { tier: 'Standard', basePrice: 99, currency: 'USD' }),
                                                        basePrice: parseInt(e.target.value) || 0
                                                    }
                                                }))}
                                                className="h-8 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-bold uppercase">Currency</Label>
                                            <Input
                                                value={editingTheme.pricing?.currency || 'USD'}
                                                onChange={e => setEditingTheme(prev => ({
                                                    ...prev,
                                                    pricing: {
                                                        ...(prev.pricing || { tier: 'Standard', basePrice: 99, currency: 'USD' }),
                                                        currency: e.target.value
                                                    }
                                                }))}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-primary/10 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] font-bold uppercase">Booking Enabled</Label>
                                            <Button
                                                size="sm"
                                                variant={editingTheme.meetingBooking?.enabled ? 'default' : 'outline'}
                                                onClick={() => setEditingTheme(prev => ({
                                                    ...prev,
                                                    meetingBooking: {
                                                        ...(prev.meetingBooking || { enabled: false, calendlyLink: '', duration: 30, requiresDeposit: false }),
                                                        enabled: !prev.meetingBooking?.enabled
                                                    }
                                                }))}
                                                className="h-6 text-[9px]"
                                            >
                                                {editingTheme.meetingBooking?.enabled ? 'YES' : 'NO'}
                                            </Button>
                                        </div>
                                        <Input
                                            placeholder="Booking Link"
                                            value={editingTheme.meetingBooking?.calendlyLink || ''}
                                            onChange={e => setEditingTheme(prev => ({
                                                ...prev,
                                                meetingBooking: {
                                                    ...(prev.meetingBooking || { enabled: false, calendlyLink: '', duration: 30, requiresDeposit: false }),
                                                    calendlyLink: e.target.value
                                                }
                                            }))}
                                            className="h-8 text-xs"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold uppercase">Duration (Min)</Label>
                                                <Input
                                                    type="number"
                                                    value={editingTheme.meetingBooking?.duration}
                                                    onChange={e => setEditingTheme(prev => ({
                                                        ...prev,
                                                        meetingBooking: {
                                                            ...(prev.meetingBooking || { enabled: false, calendlyLink: '', duration: 30, requiresDeposit: false }),
                                                            duration: parseInt(e.target.value) || 30
                                                        }
                                                    }))}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold uppercase">Deposit Amt</Label>
                                                <Input
                                                    type="number"
                                                    value={editingTheme.meetingBooking?.depositAmount || 0}
                                                    onChange={e => setEditingTheme(prev => ({
                                                        ...prev,
                                                        meetingBooking: {
                                                            ...(prev.meetingBooking || { enabled: false, calendlyLink: '', duration: 30, requiresDeposit: false }),
                                                            depositAmount: parseInt(e.target.value) || 0,
                                                            requiresDeposit: (parseInt(e.target.value) || 0) > 0
                                                        }
                                                    }))}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-border pt-6 mt-4">
                        <Button variant="outline" onClick={() => handleDialogChange(false)} className="rounded-xl px-8">Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving || !!isUploading} className="rounded-xl px-8 bg-primary hover:bg-primary/90 font-black uppercase tracking-tight">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingTheme.id ? 'Save Changes' : 'Create Theme'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
