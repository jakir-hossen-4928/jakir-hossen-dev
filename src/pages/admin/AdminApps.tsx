import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Edit3, Save, Smartphone, Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { uploadToImgBB } from '@/lib/imgbb';
import { DefaultTemplate, DefaultTemplateRef } from '@/richtexteditor/DefaultTemplate';
import { AppEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AdminAppsProps {
    apps: AppEntry[];
}

export const AdminApps: React.FC<AdminAppsProps> = ({ apps }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<Partial<AppEntry>>({});
    const [isUploadingIcon, setIsUploadingIcon] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const editorRef = useRef<DefaultTemplateRef>(null);

    const handleOpenDialog = (app?: AppEntry) => {
        if (app) {
            setEditingApp({ ...app });
        } else {
            setEditingApp({ status: 'testing', appName: '', slug: '', playStoreUrl: '' });
        }
        setIsDialogOpen(true);
    };

    const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingIcon(true);
        try {
            const url = await uploadToImgBB(file);
            setEditingApp(prev => ({ ...prev, icon: url }));
            toast.success("Icon uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload icon");
        } finally {
            setIsUploadingIcon(false);
        }
    };

    const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingCover(true);
        try {
            const url = await uploadToImgBB(file);
            setEditingApp(prev => ({ ...prev, coverPhoto: url }));
            toast.success("Cover photo uploaded");
        } catch (error) {
            toast.error("Failed to upload cover photo");
        } finally {
            setIsUploadingCover(false);
        }
    };

    const handleSave = async () => {
        if (!editingApp.appName) {
            toast.error("App Name is required");
            return;
        }

        setIsSaving(true);
        try {
            const htmlDescription = editorRef.current?.getHTML() || editingApp.description || '';
            const slug = editingApp.slug || editingApp.appName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
            const appId = editingApp.id || slug || Date.now().toString();

            const appData: AppEntry = {
                id: appId,
                slug,
                appName: editingApp.appName,
                playStoreUrl: editingApp.playStoreUrl || '',
                apkUrl: editingApp.apkUrl || '',
                icon: editingApp.icon || '',
                coverPhoto: editingApp.coverPhoto || '',
                description: htmlDescription,
                status: editingApp.status || 'testing',
                createdAt: editingApp.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await setDoc(doc(db, 'apps', appId), appData, { merge: true });
            toast.success(editingApp.id ? "App updated" : "App created");
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Error saving app");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (appId: string) => {
        if (!confirm("Delete this app?")) return;
        try {
            await deleteDoc(doc(db, 'apps', appId));
            toast.success("App deleted");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    return (
        <Card className="border border-white/5 shadow-2xl rounded-2xl overflow-hidden bg-card/30 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between bg-white/[0.02] border-b border-white/5">
                <div>
                    <CardTitle className="text-xl font-black text-foreground">App Registry</CardTitle>
                    <CardDescription className="text-muted-foreground/70">Manage your applications.</CardDescription>
                </div>
                <Button onClick={() => handleOpenDialog()} size="sm" className="rounded-xl h-9 font-black uppercase tracking-tight shadow-lg shadow-primary/20">
                    <Plus size={16} className="mr-2" /> Add App
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-white/[0.01]">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="w-[80px] pl-6 text-[10px] font-black uppercase tracking-widest">Icon</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Application</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                            <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {apps.map(app => (
                            <TableRow key={app.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <TableCell className="pl-6 py-4">
                                    <div className="w-12 h-12 rounded-[22%] overflow-hidden bg-muted/30 flex items-center justify-center border border-white/10 shadow-lg">
                                        {app.icon ? (
                                            <img src={app.icon} alt={app.appName} className="w-full h-full object-cover" />
                                        ) : (
                                            <Smartphone className="w-5 h-5 text-muted-foreground/30" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-bold text-foreground">
                                    <div>{app.appName}</div>
                                    <div className="text-[10px] text-muted-foreground font-mono mt-1">{app.playStoreUrl ? 'Play Store Linked' : 'No Link'}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={app.status === 'production' ? 'default' : 'secondary'} className={cn("font-black uppercase text-[9px]")}>
                                        {app.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6 space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(app)} className="hover:bg-primary/10 hover:text-primary rounded-lg transition-all">
                                        <Edit3 size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)} className="hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all">
                                        <Trash2 size={16} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-white/10">
                    <DialogHeader>
                        <DialogTitle>{editingApp.id ? 'Edit App' : 'New App'}</DialogTitle>
                        <DialogDescription>Fill in the details below.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>App Name</Label>
                                <Input
                                    value={editingApp.appName || ''}
                                    onChange={e => setEditingApp(prev => ({ ...prev, appName: e.target.value }))}
                                    placeholder="My Awesome App"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>URL Slug (Auto-generated)</Label>
                                <Input
                                    value={editingApp.slug || editingApp.appName?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') || ''}
                                    onChange={e => setEditingApp(prev => ({ ...prev, slug: e.target.value }))}
                                    className="font-mono text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Play Store Link</Label>
                                <Input
                                    value={editingApp.playStoreUrl || ''}
                                    onChange={e => setEditingApp(prev => ({ ...prev, playStoreUrl: e.target.value }))}
                                    placeholder="https://"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>APK Download URL</Label>
                                <Input
                                    value={editingApp.apkUrl || ''}
                                    onChange={e => setEditingApp(prev => ({ ...prev, apkUrl: e.target.value }))}
                                    placeholder="https://"
                                />
                            </div>
                        </div>

                        {/* Media Uploads */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>App Icon</Label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 rounded-xl bg-muted border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {editingApp.icon ? (
                                            <img src={editingApp.icon} className="w-full h-full object-cover" />
                                        ) : (
                                            <UploadCloud className="text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleIconUpload}
                                            disabled={isUploadingIcon}
                                            className="cursor-pointer file:cursor-pointer file:text-foreground text-xs"
                                        />
                                        {isUploadingIcon && <p className="text-xs text-primary mt-1 animate-pulse">Uploading...</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Cover Photo</Label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-24 h-16 rounded-xl bg-muted border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {editingApp.coverPhoto ? (
                                            <img src={editingApp.coverPhoto} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCoverUpload}
                                            disabled={isUploadingCover}
                                            className="cursor-pointer file:cursor-pointer file:text-foreground text-xs"
                                        />
                                        {isUploadingCover && <p className="text-xs text-primary mt-1 animate-pulse">Uploading...</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/20">
                            <Switch
                                checked={editingApp.status === 'production'}
                                onCheckedChange={(c) => setEditingApp(prev => ({ ...prev, status: c ? 'production' : 'testing' }))}
                            />
                            <div>
                                <Label>Production Mode</Label>
                                <p className="text-xs text-muted-foreground">Visible to public without login</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <div className="min-h-[200px] border rounded-xl overflow-hidden">
                                <DefaultTemplate
                                    ref={editorRef}
                                    onReady={(methods) => {
                                        if (editingApp.description) {
                                            setTimeout(() => methods.injectHTML(editingApp.description || ''), 100);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving || isUploadingIcon || isUploadingCover}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
