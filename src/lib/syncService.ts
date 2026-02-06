import { collection, onSnapshot, query, orderBy, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { db as firestore } from './firebase';
import { db, updateCacheMetadata, isCacheStale } from './db';
import { AppEntry, Comment } from '@/lib/types';

// Sync apps from Firestore to Dexie
export async function syncApps(force: boolean = false): Promise<AppEntry[]> {
    const cacheKey = 'apps';
    const isStale = await isCacheStale(cacheKey, 30); // 30 minutes cache for apps to reduce reads

    // Check if cache is fresh
    if (!force && !isStale) {
        const cachedApps = await db.apps.toArray();
        if (cachedApps.length > 0) {
            console.log('[SyncService] Returning cached apps');
            // Sort by createdAt descending
            return cachedApps.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
        }
    }

    // Fetch from Firestore
    console.log('[SyncService] Fetching apps from Firestore...');
    try {
        const appsRef = collection(firestore, 'apps');
        const q = query(appsRef);
        const snapshot = await getDocs(q);

        console.log(`[SyncService] Snapshot empty: ${snapshot.empty}, size: ${snapshot.size}`);
        if (snapshot.empty) {
            console.warn('[SyncService] No apps found in Firestore collection "apps". Check database permissions or if collection exists.');
        }

        const apps: AppEntry[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as AppEntry));

        console.log(`[SyncService] Fetched ${apps.length} apps from Firestore`);

        // Sort client-side
        apps.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        // Update Dexie cache atomically
        await db.transaction('rw', db.apps, db.metadata, async () => {
            await db.apps.clear();
            await db.apps.bulkAdd(apps);
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
    const isStale = await isCacheStale(cacheKey, 5); // 5 minutes cache for comments

    // Check if cache is fresh
    if (!force && !isStale) {
        const cachedComments = await db.comments.where('appId').equals(appId).reverse().sortBy('timestamp');
        if (cachedComments.length > 0) {
            console.log('[SyncService] Returning cached comments');
            return cachedComments;
        }
    }

    // Fetch from Firestore
    console.log('[SyncService] Fetching comments from Firestore...');
    const commentsRef = collection(firestore, 'apps', appId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    const comments: Comment[] = snapshot.docs.map(doc => ({
        id: doc.id,
        appId,
        ...doc.data()
    } as Comment));

    // Update Dexie cache atomically
    await db.transaction('rw', db.comments, db.metadata, async () => {
        await db.comments.where('appId').equals(appId).delete();
        await db.comments.bulkAdd(comments);
        await updateCacheMetadata(cacheKey);
    });

    return comments;
}

// Get single app from cache or Firestore by ID
export async function getApp(appId: string): Promise<AppEntry | null> {
    // Try cache first
    const cachedApp = await db.apps.get(appId);
    if (cachedApp) {
        return cachedApp;
    }

    // Fallback to Firestore
    const appRef = doc(firestore, 'apps', appId);
    const appDoc = await getDoc(appRef);

    if (!appDoc.exists()) {
        return null;
    }

    const app: AppEntry = {
        id: appDoc.id,
        ...appDoc.data()
    } as AppEntry;

    // Cache it
    await db.apps.put(app);

    return app;
}

// Get single app by slug from cache or Firestore
export async function getAppBySlug(slug: string): Promise<AppEntry | null> {
    // Try cache first
    const cachedApp = await db.apps.where('slug').equals(slug).first();
    if (cachedApp) {
        return cachedApp;
    }

    // Fallback to Firestore
    const appsRef = collection(firestore, 'apps');
    const q = query(appsRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const appDoc = snapshot.docs[0];
    const app: AppEntry = {
        id: appDoc.id,
        ...appDoc.data()
    } as AppEntry;

    // Cache it
    await db.apps.put(app);

    return app;
}

// Real-time sync for apps
export function subscribeToApps(callback: (apps: AppEntry[]) => void): () => void {
    const appsRef = collection(firestore, 'apps');
    const q = query(appsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const apps: AppEntry[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as AppEntry));

        // Update cache
        await db.apps.clear();
        await db.apps.bulkAdd(apps);
        await updateCacheMetadata('apps');

        callback(apps);
    });

    return unsubscribe;
}

// Real-time sync for comments
export function subscribeToComments(appId: string, callback: (comments: Comment[]) => void): () => void {
    const commentsRef = collection(firestore, 'apps', appId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const comments: Comment[] = snapshot.docs.map(doc => ({
            id: doc.id,
            appId,
            ...doc.data()
        } as Comment));

        // Update cache
        await db.comments.where('appId').equals(appId).delete();
        await db.comments.bulkAdd(comments);
        await updateCacheMetadata(`comments_${appId}`);

        callback(comments);
    });

    return unsubscribe;
}

// Add new app to cache
export async function addAppToCache(app: AppEntry): Promise<void> {
    await db.apps.put(app);
}

// Update app in cache
export async function updateAppInCache(appId: string, updates: Partial<AppEntry>): Promise<void> {
    await db.apps.update(appId, updates);
}

// Delete app from cache
export async function deleteAppFromCache(appId: string): Promise<void> {
    await db.apps.delete(appId);
    await db.comments.where('appId').equals(appId).delete();
}

// Add comment to cache
export async function addCommentToCache(comment: Comment): Promise<void> {
    await db.comments.put(comment);
}
