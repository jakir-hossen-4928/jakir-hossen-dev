import { collection, onSnapshot, query, orderBy, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { db as firestore } from './firebase';
import { db, updateCacheMetadata, isCacheStale } from './db';
import { AppEntry, Comment, Tester, Subscriber, BlogPost } from '@/lib/types';

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

// Sync testers from Firestore to Dexie
export async function syncTesters(force: boolean = false): Promise<Tester[]> {
    const cacheKey = 'testers';
    const isStale = await isCacheStale(cacheKey, 30); // 30 minutes cache

    // Check if cache is fresh
    if (!force && !isStale) {
        const cachedTesters = await db.testers.orderBy('joinedAt').reverse().toArray();
        if (cachedTesters.length > 0) {
            console.log('[SyncService] Returning cached testers');
            return cachedTesters;
        }
    }

    // Fetch from Firestore
    console.log('[SyncService] Fetching testers from Firestore...');
    try {
        const testersRef = collection(firestore, 'testers');
        const q = query(testersRef, orderBy('joinedAt', 'desc'));
        const snapshot = await getDocs(q);

        const testers: Tester[] = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as Tester));

        console.log(`[SyncService] Fetched ${testers.length} testers from Firestore`);

        // Update Dexie cache atomically
        await db.transaction('rw', db.testers, db.metadata, async () => {
            await db.testers.clear();
            await db.testers.bulkAdd(testers);
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
    const isStale = await isCacheStale(cacheKey, 30); // 30 minutes cache

    // Check if cache is fresh
    if (!force && !isStale) {
        const cachedSubscribers = await db.subscribers.orderBy('joinedAt').reverse().toArray();
        if (cachedSubscribers.length > 0) {
            console.log('[SyncService] Returning cached subscribers');
            return cachedSubscribers;
        }
    }

    // Fetch from Firestore
    console.log('[SyncService] Fetching subscribers from Firestore...');
    try {
        const subscribersRef = collection(firestore, 'subscribers');
        const q = query(subscribersRef, orderBy('joinedAt', 'desc'));
        const snapshot = await getDocs(q);

        const subscribers: Subscriber[] = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as Subscriber));

        console.log(`[SyncService] Fetched ${subscribers.length} subscribers from Firestore`);

        // Update Dexie cache atomically
        await db.transaction('rw', db.subscribers, db.metadata, async () => {
            await db.subscribers.clear();
            await db.subscribers.bulkAdd(subscribers);
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
    const q = query(testersRef, orderBy('joinedAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const testers: Tester[] = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as Tester));

        // Update cache
        await db.testers.clear();
        await db.testers.bulkAdd(testers);
        await updateCacheMetadata('testers');

        callback(testers);
    });

    return unsubscribe;
}

// Real-time sync for subscribers
export function subscribeToSubscribers(callback: (subscribers: Subscriber[]) => void): () => void {
    const subscribersRef = collection(firestore, 'subscribers');
    const q = query(subscribersRef, orderBy('joinedAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const subscribers: Subscriber[] = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as Subscriber));

        // Update cache
        await db.subscribers.clear();
        await db.subscribers.bulkAdd(subscribers);
        await updateCacheMetadata('subscribers');

        callback(subscribers);
    });

    return unsubscribe;
}

// Sync blogs from Firestore to Dexie
export async function syncBlogs(force: boolean = false): Promise<BlogPost[]> {
    const cacheKey = 'blogs';
    const isStale = await isCacheStale(cacheKey, 30); // 30 minutes cache

    // Check if cache is fresh
    if (!force && !isStale) {
        const cachedBlogs = await db.blogs.orderBy('date').reverse().toArray();
        if (cachedBlogs.length > 0) {
            console.log('[SyncService] Returning cached blogs');
            return cachedBlogs;
        }
    }

    // Fetch from Firestore
    console.log('[SyncService] Fetching blogs from Firestore...');
    try {
        const blogsRef = collection(firestore, 'blogs');
        const q = query(blogsRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);

        const blogs: BlogPost[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Ensure default status if missing
                status: data.status || 'published',
                date: data.date || new Date().toISOString().split('T')[0]
            } as BlogPost;
        });

        console.log(`[SyncService] Successfully fetched ${blogs.length} blogs from Firestore`);

        // Update Dexie cache atomically
        await db.transaction('rw', db.blogs, db.metadata, async () => {
            await db.blogs.clear();
            await db.blogs.bulkAdd(blogs);
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
    const q = query(blogsRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const blogs: BlogPost[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as BlogPost));

        // Update cache
        await db.blogs.clear();
        await db.blogs.bulkAdd(blogs);
        await updateCacheMetadata('blogs');

        callback(blogs);
    });

    return unsubscribe;
}


// Add tester to cache
export async function addTesterToCache(tester: Tester): Promise<void> {
    await db.testers.put(tester);
}

// Add subscriber to cache
export async function addSubscriberToCache(subscriber: Subscriber): Promise<void> {
    await db.subscribers.put(subscriber);
}

// Delete tester from cache
export async function deleteTesterFromCache(uid: string): Promise<void> {
    await db.testers.delete(uid);
}

// Delete subscriber from cache
export async function deleteSubscriberFromCache(uid: string): Promise<void> {
    await db.subscribers.delete(uid);
}

