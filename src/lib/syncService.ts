import { collection, onSnapshot, query, orderBy, getDocs, doc, getDoc, where, limit } from 'firebase/firestore';
import { db as firestore } from './firebase';
import { db, updateCacheMetadata, isCacheStale } from './db';
import { AppEntry, Comment, Tester, Subscriber, BlogPost, Note, BookmarkFolder, BookmarkLink, WebTheme } from '@/lib/types';
import { Timestamp, deleteDoc, setDoc, addDoc } from 'firebase/firestore';

// Helper to convert Firestore Timestamp to ISO string
function formatTimestamp(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    if (timestamp instanceof Timestamp) return timestamp.toDate().toISOString();
    if (timestamp instanceof Date) return timestamp.toISOString();
    if (typeof timestamp === 'string') return timestamp;
    if (timestamp.seconds !== undefined) {
        return new Timestamp(timestamp.seconds, timestamp.nanoseconds || 0).toDate().toISOString();
    }
    return new Date().toISOString();
}

// Helper to map raw theme data
export function mapWebTheme(docId: string, data: any): WebTheme {
    return {
        id: docId,
        name: data.name || '',
        tagline: data.tagline || '',
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        previewUrl: data.previewUrl || '',
        category: data.category || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        colorPalette: data.colorPalette || {
            primary: '#000000',
            secondary: '#333333',
            accent: '#666666',
            background: '#FFFFFF',
            text: '#000000'
        },
        typography: data.typography || {
            heading: 'Sans-serif',
            body: 'Sans-serif'
        },
        features: Array.isArray(data.features) ? data.features : [],
        bestFor: Array.isArray(data.bestFor) ? data.bestFor : [],
        complexity: data.complexity || 'medium',
        popularity: data.popularity || 0,
        pricing: data.pricing || {
            tier: 'standard',
            basePrice: 0,
            currency: 'USD'
        },
        meetingBooking: data.meetingBooking || {
            enabled: false,
            calendlyLink: '',
            duration: 30,
            requiresDeposit: false
        },
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt)
    } as WebTheme;
}

// Helper to map raw app data with defaults
function mapAppEntry(docId: string, data: any): AppEntry {
    return {
        id: docId,
        slug: data.slug || '',
        appName: data.appName || 'Untitled App',
        status: data.status || 'closed_testing',
        playStoreUrl: data.playStoreUrl || '',
        apkUrl: data.apkUrl || '',
        icon: data.icon || '',
        description: data.description || '',
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt),
    } as AppEntry;
}

// Helper to map raw blog data with defaults
function mapBlogPost(docId: string, data: any): BlogPost {
    const rawCategories = data.categories;
    const categories = Array.isArray(rawCategories) ? rawCategories : [];

    return {
        id: docId,
        slug: data.slug || '',
        title: data.title || 'Untitled Post',
        date: data.date || new Date().toISOString().split('T')[0],
        categories: categories,
        description: data.description || '',
        excerpt: data.excerpt || (data.description ? data.description.replace(/<[^>]*>/g, '').slice(0, 160) + '...' : ''),
        status: data.status || 'published',
        author: data.author || 'Jakir Hossen',
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt),
        thumbnailColor: data.thumbnailColor || 'bg-primary'
    } as BlogPost;
}

// Helper to map raw note data
function mapNote(docId: string, data: any): Note {
    return {
        id: docId,
        title: data.title || '',
        content: data.content || '',
        isPinned: data.isPinned || false,
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt),
    } as Note;
}

// Helper to map raw folder data
function mapBookmarkFolder(docId: string, data: any): BookmarkFolder {
    return {
        id: docId,
        name: data.name || '',
        parentId: data.parentId || null,
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt),
    } as BookmarkFolder;
}

// Helper to map raw link data
function mapBookmarkLink(docId: string, data: any): BookmarkLink {
    return {
        id: docId,
        title: data.title || '',
        url: data.url || '',
        folderId: data.folderId || null,
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt),
    } as BookmarkLink;
}

// Sync apps from Firestore to Dexie
export async function syncApps(force: boolean = false): Promise<AppEntry[]> {
    const cacheKey = 'apps';
    const isStale = await isCacheStale(cacheKey, 30);
    if (!force && !isStale) {
        const cachedApps = await db.apps.toArray();
        if (cachedApps.length > 0) {
            return cachedApps.map(app => mapAppEntry(app.id, app)).sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
        }
    }
    try {
        const appsRef = collection(firestore, 'apps');
        const q = query(appsRef, orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const apps: AppEntry[] = snapshot.docs.map(doc => mapAppEntry(doc.id, doc.data()));
        apps.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
        await db.transaction('rw', db.apps, db.metadata, async () => {
            await db.apps.clear();
            await db.apps.bulkPut(apps);
            await updateCacheMetadata(cacheKey);
        });
        return apps;
    } catch (error) {
        console.error('[SyncService] Error fetching apps from Firestore:', error);
        throw error;
    }
}

// Sync comments for a specific app
export async function syncComments(appId: string, force: boolean = false): Promise<Comment[]> {
    const cacheKey = `comments_${appId}`;
    const isStale = await isCacheStale(cacheKey, 5);
    if (!force && !isStale) {
        const cachedComments = await db.comments.where('appId').equals(appId).reverse().sortBy('timestamp');
        if (cachedComments.length > 0) return cachedComments;
    }
    const commentsRef = collection(firestore, 'apps', appId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const comments: Comment[] = snapshot.docs.map(doc => ({
        id: doc.id,
        appId,
        ...doc.data()
    } as Comment));
    await db.transaction('rw', db.comments, db.metadata, async () => {
        await db.comments.where('appId').equals(appId).delete();
        await db.comments.bulkPut(comments);
        await updateCacheMetadata(cacheKey);
    });
    return comments;
}

// Get single app from cache or Firestore by ID
export async function getApp(appId: string): Promise<AppEntry | null> {
    const cachedApp = await db.apps.get(appId);
    if (cachedApp) return mapAppEntry(cachedApp.id, cachedApp);
    const appRef = doc(firestore, 'apps', appId);
    const appDoc = await getDoc(appRef);
    if (!appDoc.exists()) return null;
    const app = mapAppEntry(appDoc.id, appDoc.data());
    await db.apps.put(app);
    return app;
}

// Get single app by slug from cache or Firestore
export async function getAppBySlug(slug: string): Promise<AppEntry | null> {
    const cachedApp = await db.apps.where('slug').equals(slug).first();
    if (cachedApp) return mapAppEntry(cachedApp.id, cachedApp);
    const appsRef = collection(firestore, 'apps');
    const q = query(appsRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const appDoc = snapshot.docs[0];
    const app = mapAppEntry(appDoc.id, appDoc.data());
    await db.apps.put(app);
    return app;
}

// Real-time sync for apps
export function subscribeToApps(callback: (apps: AppEntry[]) => void): () => void {
    const appsRef = collection(firestore, 'apps');
    const q = query(appsRef, orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, async (snapshot) => {
        const apps: AppEntry[] = snapshot.docs.map(doc => mapAppEntry(doc.id, doc.data()));
        await db.transaction('rw', db.apps, db.metadata, async () => {
            await db.apps.clear();
            await db.apps.bulkPut(apps);
            await updateCacheMetadata('apps');
        });
        callback(apps);
    });
}

// Real-time sync for comments
export function subscribeToComments(appId: string, callback: (comments: Comment[]) => void): () => void {
    const commentsRef = collection(firestore, 'apps', appId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));
    return onSnapshot(q, async (snapshot) => {
        const comments: Comment[] = snapshot.docs.map(doc => ({
            id: doc.id,
            appId,
            ...doc.data()
        } as Comment));
        await db.transaction('rw', db.comments, db.metadata, async () => {
            await db.comments.where('appId').equals(appId).delete();
            await db.comments.bulkPut(comments);
            await updateCacheMetadata(`comments_${appId}`);
        });
        callback(comments);
    });
}

export async function addAppToCache(app: AppEntry): Promise<void> {
    await db.apps.put(app);
}

export async function updateAppInCache(appId: string, updates: Partial<AppEntry>): Promise<void> {
    await db.apps.update(appId, updates);
}

export async function deleteAppFromCache(appId: string): Promise<void> {
    await db.apps.delete(appId);
    await db.comments.where('appId').equals(appId).delete();
}

export async function deleteApp(appId: string): Promise<void> {
    try {
        const commentsRef = collection(firestore, 'apps', appId, 'comments');
        const commentsSnapshot = await getDocs(commentsRef);
        const commentDeletions = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(commentDeletions);
        await deleteDoc(doc(firestore, 'apps', appId));
        await deleteAppFromCache(appId);
    } catch (error) {
        console.error('[SyncService] Error in cascade deleteApp:', error);
        throw error;
    }
}

export async function addCommentToCache(comment: Comment): Promise<void> {
    await db.comments.put(comment);
}

// Sync testers from Firestore to Dexie
export async function syncTesters(force: boolean = false): Promise<Tester[]> {
    const cacheKey = 'testers';
    const isStale = await isCacheStale(cacheKey, 30);
    if (!force && !isStale) {
        const cachedTesters = await db.testers.orderBy('joinedAt').reverse().toArray();
        if (cachedTesters.length > 0) return cachedTesters;
    }
    try {
        const testersRef = collection(firestore, 'testers');
        const q = query(testersRef, orderBy('joinedAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const testers: Tester[] = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as Tester));
        await db.transaction('rw', db.testers, db.metadata, async () => {
            await db.testers.clear();
            await db.testers.bulkPut(testers);
            await updateCacheMetadata(cacheKey);
        });
        return testers;
    } catch (error) {
        console.error('[SyncService] Error fetching testers from Firestore:', error);
        throw error;
    }
}

// Sync subscribers from Firestore to Dexie
export async function syncSubscribers(force: boolean = false): Promise<Subscriber[]> {
    const cacheKey = 'subscribers';
    const isStale = await isCacheStale(cacheKey, 30);
    if (!force && !isStale) {
        const cachedSubscribers = await db.subscribers.orderBy('joinedAt').reverse().toArray();
        if (cachedSubscribers.length > 0) return cachedSubscribers;
    }
    try {
        const subscribersRef = collection(firestore, 'subscribers');
        const q = query(subscribersRef, orderBy('joinedAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const subscribers: Subscriber[] = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as Subscriber));
        await db.transaction('rw', db.subscribers, db.metadata, async () => {
            await db.subscribers.clear();
            await db.subscribers.bulkPut(subscribers);
            await updateCacheMetadata(cacheKey);
        });
        return subscribers;
    } catch (error) {
        console.error('[SyncService] Error fetching subscribers from Firestore:', error);
        throw error;
    }
}

// Real-time sync for testers
export function subscribeToTesters(callback: (testers: Tester[]) => void): () => void {
    const testersRef = collection(firestore, 'testers');
    const q = query(testersRef, orderBy('joinedAt', 'desc'), limit(50));
    return onSnapshot(q, async (snapshot) => {
        const testers: Tester[] = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as Tester));
        await db.transaction('rw', db.testers, db.metadata, async () => {
            await db.testers.clear();
            await db.testers.bulkPut(testers);
            await updateCacheMetadata('testers');
        });
        callback(testers);
    });
}

// Real-time sync for subscribers
export function subscribeToSubscribers(callback: (subscribers: Subscriber[]) => void): () => void {
    const subscribersRef = collection(firestore, 'subscribers');
    const q = query(subscribersRef, orderBy('joinedAt', 'desc'), limit(50));
    return onSnapshot(q, async (snapshot) => {
        const subscribers: Subscriber[] = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as Subscriber));
        await db.transaction('rw', db.subscribers, db.metadata, async () => {
            await db.subscribers.clear();
            await db.subscribers.bulkPut(subscribers);
            await updateCacheMetadata('subscribers');
        });
        callback(subscribers);
    });
}

// Sync blogs from Firestore to Dexie
export async function syncBlogs(force: boolean = false): Promise<BlogPost[]> {
    const cacheKey = 'blogs';
    const isStale = await isCacheStale(cacheKey, 30);
    if (!force && !isStale) {
        const cachedBlogs = await db.blogs.orderBy('date').reverse().toArray();
        if (cachedBlogs.length > 0) return cachedBlogs.map(blog => mapBlogPost(blog.id, blog));
    }
    try {
        const blogsRef = collection(firestore, 'blogs');
        const q = query(blogsRef, orderBy('date', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const blogs: BlogPost[] = snapshot.docs.map(doc => mapBlogPost(doc.id, doc.data()));
        await db.transaction('rw', db.blogs, db.metadata, async () => {
            await db.blogs.clear();
            await db.blogs.bulkPut(blogs);
            await updateCacheMetadata(cacheKey);
        });
        return blogs;
    } catch (error) {
        console.error('[SyncService] Error fetching blogs from Firestore:', error);
        throw error;
    }
}

// Real-time sync for blogs
export function subscribeToBlogs(callback: (blogs: BlogPost[]) => void): () => void {
    const blogsRef = collection(firestore, 'blogs');
    const q = query(blogsRef, orderBy('date', 'desc'), limit(50));
    return onSnapshot(q, async (snapshot) => {
        const blogs: BlogPost[] = snapshot.docs.map(doc => mapBlogPost(doc.id, doc.data()));
        await db.transaction('rw', db.blogs, db.metadata, async () => {
            await db.blogs.clear();
            await db.blogs.bulkPut(blogs);
            await updateCacheMetadata('blogs');
        });
        callback(blogs);
    });
}

// Delete blog post from Firestore and Cache
export async function deleteBlogPost(id: string): Promise<void> {
    try {
        await deleteDoc(doc(firestore, 'blogs', id));
        await db.blogs.delete(id);
    } catch (error) {
        console.error('[SyncService] Error deleting blog post:', error);
        throw error;
    }
}

export async function addTesterToCache(tester: Tester): Promise<void> {
    await db.testers.put(tester);
}

export async function addSubscriberToCache(subscriber: Subscriber): Promise<void> {
    await db.subscribers.put(subscriber);
}

export async function deleteTesterFromCache(uid: string): Promise<void> {
    await db.testers.delete(uid);
}

export async function deleteSubscriberFromCache(uid: string): Promise<void> {
    await db.subscribers.delete(uid);
}

export async function deleteSubscriber(uid: string): Promise<void> {
    try {
        await deleteDoc(doc(firestore, 'subscribers', uid));
        await deleteSubscriberFromCache(uid);
    } catch (error) {
        console.error('[SyncService] Error deleting subscriber:', error);
        throw error;
    }
}

// Sync notes from Firestore to Dexie
export async function syncNotes(force: boolean = false): Promise<Note[]> {
    const cacheKey = 'notes';
    const isStale = await isCacheStale(cacheKey, 30);
    if (!force && !isStale) {
        const cachedNotes = await db.notes.orderBy('createdAt').reverse().toArray();
        if (cachedNotes.length > 0) return cachedNotes;
    }
    try {
        const notesRef = collection(firestore, 'notes');
        const q = query(notesRef, orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const notes: Note[] = snapshot.docs.map(doc => mapNote(doc.id, doc.data()));
        await db.transaction('rw', db.notes, db.metadata, async () => {
            await db.notes.clear();
            await db.notes.bulkPut(notes);
            await updateCacheMetadata(cacheKey);
        });
        return notes;
    } catch (error) {
        console.error('[SyncService] Error fetching notes from Firestore:', error);
        throw error;
    }
}

// Real-time sync for notes
export function subscribeToNotes(callback: (notes: Note[]) => void): () => void {
    const notesRef = collection(firestore, 'notes');
    const q = query(notesRef, orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, async (snapshot) => {
        const notes: Note[] = snapshot.docs.map(doc => mapNote(doc.id, doc.data()));
        await db.transaction('rw', db.notes, db.metadata, async () => {
            await db.notes.clear();
            await db.notes.bulkPut(notes);
            await updateCacheMetadata('notes');
        });
        callback(notes);
    });
}

// Add a new note
export async function addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
        const now = new Date();
        const noteData = {
            ...note,
            createdAt: Timestamp.fromDate(now),
            updatedAt: Timestamp.fromDate(now)
        };
        const docRef = await addDoc(collection(firestore, 'notes'), noteData);
        return docRef.id;
    } catch (error) {
        console.error('[SyncService] Error adding note:', error);
        throw error;
    }
}

// Update an existing note
export async function updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
        const noteRef = doc(firestore, 'notes', id);
        await setDoc(noteRef, {
            ...updates,
            updatedAt: Timestamp.fromDate(new Date())
        }, { merge: true });
    } catch (error) {
        console.error('[SyncService] Error updating note:', error);
        throw error;
    }
}

// Delete a note
export async function deleteNote(id: string): Promise<void> {
    try {
        await deleteDoc(doc(firestore, 'notes', id));
        await db.notes.delete(id);
    } catch (error) {
        console.error('[SyncService] Error deleting note:', error);
        throw error;
    }
}

// Sync bookmark folders
export async function syncBookmarkFolders(force: boolean = false): Promise<BookmarkFolder[]> {
    const cacheKey = 'bookmarkFolders';
    const isStale = await isCacheStale(cacheKey, 30);
    if (!force && !isStale) {
        const cached = await db.bookmarkFolders.orderBy('createdAt').reverse().toArray();
        if (cached.length > 0) return cached;
    }
    try {
        const ref = collection(firestore, 'bookmarkFolders');
        const q = query(ref, orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const folders = snapshot.docs.map(doc => mapBookmarkFolder(doc.id, doc.data()));
        await db.transaction('rw', db.bookmarkFolders, db.metadata, async () => {
            await db.bookmarkFolders.clear();
            await db.bookmarkFolders.bulkPut(folders);
            await updateCacheMetadata(cacheKey);
        });
        return folders;
    } catch (error) {
        console.error('[SyncService] Error syncing bookmark folders:', error);
        throw error;
    }
}

// Real-time sync for bookmark folders
export function subscribeToBookmarkFolders(callback: (folders: BookmarkFolder[]) => void): () => void {
    const ref = collection(firestore, 'bookmarkFolders');
    const q = query(ref, orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, async (snapshot) => {
        const folders = snapshot.docs.map(doc => mapBookmarkFolder(doc.id, doc.data()));
        await db.transaction('rw', db.bookmarkFolders, db.metadata, async () => {
            await db.bookmarkFolders.clear();
            await db.bookmarkFolders.bulkPut(folders);
            await updateCacheMetadata('bookmarkFolders');
        });
        callback(folders);
    });
}

// Sync bookmark links
export async function syncBookmarkLinks(force: boolean = false): Promise<BookmarkLink[]> {
    const cacheKey = 'bookmarkLinks';
    const isStale = await isCacheStale(cacheKey, 30);
    if (!force && !isStale) {
        const cached = await db.bookmarkLinks.orderBy('createdAt').reverse().toArray();
        if (cached.length > 0) return cached;
    }
    try {
        const ref = collection(firestore, 'bookmarkLinks');
        const q = query(ref, orderBy('createdAt', 'desc'), limit(200));
        const snapshot = await getDocs(q);
        const links = snapshot.docs.map(doc => mapBookmarkLink(doc.id, doc.data()));
        await db.transaction('rw', db.bookmarkLinks, db.metadata, async () => {
            await db.bookmarkLinks.clear();
            await db.bookmarkLinks.bulkPut(links);
            await updateCacheMetadata(cacheKey);
        });
        return links;
    } catch (error) {
        console.error('[SyncService] Error syncing bookmark links:', error);
        throw error;
    }
}

// Real-time sync for bookmark links
export function subscribeToBookmarkLinks(callback: (links: BookmarkLink[]) => void): () => void {
    const ref = collection(firestore, 'bookmarkLinks');
    const q = query(ref, orderBy('createdAt', 'desc'), limit(200));
    return onSnapshot(q, async (snapshot) => {
        const links = snapshot.docs.map(doc => mapBookmarkLink(doc.id, doc.data()));
        await db.transaction('rw', db.bookmarkLinks, db.metadata, async () => {
            await db.bookmarkLinks.clear();
            await db.bookmarkLinks.bulkPut(links);
            await updateCacheMetadata('bookmarkLinks');
        });
        callback(links);
    });
}

// Sync themes from Firestore to Dexie
export async function syncThemes(force: boolean = false): Promise<WebTheme[]> {
    const cacheKey = 'themes';
    const isStale = await isCacheStale(cacheKey, 30);
    if (!force && !isStale) {
        const cached = await db.themes.toArray();
        if (cached.length > 0) return cached.map(t => mapWebTheme(t.id, t)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    try {
        const ref = collection(firestore, 'themes');
        const q = query(ref, orderBy('createdAt', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        const themes = snapshot.docs.map(doc => mapWebTheme(doc.id, doc.data()));
        await db.transaction('rw', db.themes, db.metadata, async () => {
            await db.themes.clear();
            await db.themes.bulkPut(themes);
            await updateCacheMetadata(cacheKey);
        });
        return themes;
    } catch (error) {
        console.error('[SyncService] Error syncing themes:', error);
        throw error;
    }
}

// Real-time sync for themes
export function subscribeToThemes(callback: (themes: WebTheme[]) => void, onError?: (error: any) => void): () => void {
    const ref = collection(firestore, 'themes');
    const q = query(ref, orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(q,
        async (snapshot) => {
            const themes = snapshot.docs.map(doc => mapWebTheme(doc.id, doc.data()));
            await db.transaction('rw', db.themes, db.metadata, async () => {
                await db.themes.clear();
                await db.themes.bulkPut(themes);
                await updateCacheMetadata('themes');
            });
            callback(themes);
        },
        (error) => {
            console.error('[SyncService] Error in subscribeToThemes:', error);
            if (onError) onError(error);
        }
    );
}

export async function addTheme(theme: Omit<WebTheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(collection(firestore, 'themes'), {
        ...theme,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
    });
    return docRef.id;
}

export async function updateTheme(id: string, updates: Partial<Omit<WebTheme, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await setDoc(doc(firestore, 'themes', id), {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
    }, { merge: true });
}

export async function deleteTheme(id: string): Promise<void> {
    await deleteDoc(doc(firestore, 'themes', id));
    await db.themes.delete(id);
}
