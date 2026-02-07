import { collection, onSnapshot, query, orderBy, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { db as firestore } from './firebase';
import { db, updateCacheMetadata, isCacheStale } from './db';
import { AppEntry, Comment, Tester, Subscriber, BlogPost } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

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

// Helper to map raw app data with defaults
function mapAppEntry(docId: string, data: any): AppEntry {
    console.log(`[SyncService] Mapping app data for ID: ${docId}`, { hasAppName: !!data.appName, status: data.status });
    return {
        id: docId,
        slug: data.slug || '',
        appName: data.appName || 'Untitled App',
        status: data.status || 'testing',
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
    console.log(`[SyncService] Mapping blog data for ID: ${docId}`, { title: data.title, status: data.status });

    // Extra safety for categories as it's a common source of filtering crashes
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

// Sync apps from Firestore to Dexie
export async function syncApps(force: boolean = false): Promise<AppEntry[]> {
    const cacheKey = 'apps';
    const isStale = await isCacheStale(cacheKey, 30); // 30 minutes cache for apps to reduce reads

    console.log(`[SyncService] syncApps called. force: ${force}, isStale: ${isStale}`);

    // Check if cache is fresh
    if (!force && !isStale) {
        const cachedApps = await db.apps.toArray();
        if (cachedApps.length > 0) {
            console.log(`[SyncService] Returning ${cachedApps.length} cached apps`);
            // Ensure cached data also has robust defaults applied
            const mappedApps = cachedApps.map(app => mapAppEntry(app.id, app));
            // Sort by createdAt descending
            return mappedApps.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
        }
        console.log('[SyncService] Cache empty or not found, proceeding to fetch.');
    }

    // Fetch from Firestore
    console.log('[SyncService] Fetching apps from Firestore...');
    try {
        const appsRef = collection(firestore, 'apps');
        const q = query(appsRef);
        const snapshot = await getDocs(q);

        console.log(`[SyncService] Firestore response - empty: ${snapshot.empty}, size: ${snapshot.size}`);

        const apps: AppEntry[] = snapshot.docs.map(doc => mapAppEntry(doc.id, doc.data()));

        console.log(`[SyncService] Processed ${apps.length} apps from Firestore`);

        // Sort client-side
        apps.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        // Update Dexie cache atomically
        console.log(`[SyncService] Updating Dexie cache for ${apps.length} apps`);
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
    const isStale = await isCacheStale(cacheKey, 5); // 5 minutes cache for comments

    console.log(`[SyncService] syncComments called for appId: ${appId}. force: ${force}, isStale: ${isStale}`);

    // Check if cache is fresh
    if (!force && !isStale) {
        const cachedComments = await db.comments.where('appId').equals(appId).reverse().sortBy('timestamp');
        if (cachedComments.length > 0) {
            console.log(`[SyncService] Returning ${cachedComments.length} cached comments for appId: ${appId}`);
            return cachedComments;
        }
    }

    // Fetch from Firestore
    console.log(`[SyncService] Fetching comments for appId: ${appId} from Firestore...`);
    const commentsRef = collection(firestore, 'apps', appId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    const comments: Comment[] = snapshot.docs.map(doc => ({
        id: doc.id,
        appId,
        ...doc.data()
    } as Comment));

    console.log(`[SyncService] Processed ${comments.length} comments for appId: ${appId}`);

    // Update Dexie cache atomically
    await db.transaction('rw', db.comments, db.metadata, async () => {
        await db.comments.where('appId').equals(appId).delete();
        await db.comments.bulkPut(comments);
        await updateCacheMetadata(cacheKey);
    });

    return comments;
}

// Get single app from cache or Firestore by ID
export async function getApp(appId: string): Promise<AppEntry | null> {
    console.log(`[SyncService] getApp called for ID: ${appId}`);
    // Try cache first
    const cachedApp = await db.apps.get(appId);
    if (cachedApp) {
        console.log(`[SyncService] Returning cached app for ID: ${appId}`);
        return mapAppEntry(cachedApp.id, cachedApp);
    }

    // Fallback to Firestore
    console.log(`[SyncService] App not in cache, fetching from Firestore for ID: ${appId}`);
    const appRef = doc(firestore, 'apps', appId);
    const appDoc = await getDoc(appRef);

    if (!appDoc.exists()) {
        console.warn(`[SyncService] App with ID ${appId} not found in Firestore`);
        return null;
    }

    const app = mapAppEntry(appDoc.id, appDoc.data());

    // Cache it
    await db.apps.put(app);

    return app;
}

// Get single app by slug from cache or Firestore
export async function getAppBySlug(slug: string): Promise<AppEntry | null> {
    console.log(`[SyncService] getAppBySlug called for slug: ${slug}`);
    // Try cache first
    const cachedApp = await db.apps.where('slug').equals(slug).first();
    if (cachedApp) {
        console.log(`[SyncService] Returning cached app for slug: ${slug}`);
        return mapAppEntry(cachedApp.id, cachedApp);
    }

    // Fallback to Firestore
    console.log(`[SyncService] App not in cache, fetching from Firestore for slug: ${slug}`);
    const appsRef = collection(firestore, 'apps');
    const q = query(appsRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.warn(`[SyncService] App with slug ${slug} not found in Firestore`);
        return null;
    }

    const appDoc = snapshot.docs[0];
    const app = mapAppEntry(appDoc.id, appDoc.data());

    // Cache it
    await db.apps.put(app);

    return app;
}

// Real-time sync for apps
export function subscribeToApps(callback: (apps: AppEntry[]) => void): () => void {
    console.log('[SyncService] subscribeToApps initialized');
    const appsRef = collection(firestore, 'apps');
    const q = query(appsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const apps: AppEntry[] = snapshot.docs.map(doc => mapAppEntry(doc.id, doc.data()));
        console.log(`[SyncService] subscribeToApps snapshot update: ${apps.length} apps`);

        // Update cache
        await db.transaction('rw', db.apps, db.metadata, async () => {
            await db.apps.clear();
            await db.apps.bulkPut(apps);
            await updateCacheMetadata('apps');
        });

        callback(apps);
    });

    return unsubscribe;
}

// Real-time sync for comments
export function subscribeToComments(appId: string, callback: (comments: Comment[]) => void): () => void {
    console.log(`[SyncService] subscribeToComments initialized for appId: ${appId}`);
    const commentsRef = collection(firestore, 'apps', appId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const comments: Comment[] = snapshot.docs.map(doc => ({
            id: doc.id,
            appId,
            ...doc.data()
        } as Comment));
        console.log(`[SyncService] subscribeToComments snapshot update for appId: ${appId}: ${comments.length} comments`);

        // Update cache
        await db.transaction('rw', db.comments, db.metadata, async () => {
            await db.comments.where('appId').equals(appId).delete();
            await db.comments.bulkPut(comments);
            await updateCacheMetadata(`comments_${appId}`);
        });

        callback(comments);
    });

    return unsubscribe;
}

// Add new app to cache
export async function addAppToCache(app: AppEntry): Promise<void> {
    console.log(`[SyncService] Adding app to cache: ${app.id}`);
    await db.apps.put(app);
}

// Update app in cache
export async function updateAppInCache(appId: string, updates: Partial<AppEntry>): Promise<void> {
    console.log(`[SyncService] Updating app in cache: ${appId}`);
    await db.apps.update(appId, updates);
}

// Delete app from cache
export async function deleteAppFromCache(appId: string): Promise<void> {
    console.log(`[SyncService] Deleting app from cache: ${appId}`);
    await db.apps.delete(appId);
    await db.comments.where('appId').equals(appId).delete();
}

// Add comment to cache
export async function addCommentToCache(comment: Comment): Promise<void> {
    console.log(`[SyncService] Adding comment to cache: ${comment.id}`);
    await db.comments.put(comment);
}

// Sync testers from Firestore to Dexie
export async function syncTesters(force: boolean = false): Promise<Tester[]> {
    const cacheKey = 'testers';
    const isStale = await isCacheStale(cacheKey, 30); // 30 minutes cache

    console.log(`[SyncService] syncTesters called. force: ${force}, isStale: ${isStale}`);

    // Check if cache is fresh
    if (!force && !isStale) {
        const cachedTesters = await db.testers.orderBy('joinedAt').reverse().toArray();
        if (cachedTesters.length > 0) {
            console.log(`[SyncService] Returning ${cachedTesters.length} cached testers`);
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

        console.log(`[SyncService] Processed ${testers.length} testers from Firestore`);

        // Update Dexie cache atomically
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
    const isStale = await isCacheStale(cacheKey, 30); // 30 minutes cache

    console.log(`[SyncService] syncSubscribers called. force: ${force}, isStale: ${isStale}`);

    // Check if cache is fresh
    if (!force && !isStale) {
        const cachedSubscribers = await db.subscribers.orderBy('joinedAt').reverse().toArray();
        if (cachedSubscribers.length > 0) {
            console.log(`[SyncService] Returning ${cachedSubscribers.length} cached subscribers`);
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

        console.log(`[SyncService] Processed ${subscribers.length} subscribers from Firestore`);

        // Update Dexie cache atomically
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
    console.log('[SyncService] subscribeToTesters initialized');
    const testersRef = collection(firestore, 'testers');
    const q = query(testersRef, orderBy('joinedAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const testers: Tester[] = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as Tester));
        console.log(`[SyncService] subscribeToTesters snapshot update: ${testers.length} testers`);

        // Update cache
        await db.transaction('rw', db.testers, db.metadata, async () => {
            await db.testers.clear();
            await db.testers.bulkPut(testers);
            await updateCacheMetadata('testers');
        });

        callback(testers);
    });

    return unsubscribe;
}

// Real-time sync for subscribers
export function subscribeToSubscribers(callback: (subscribers: Subscriber[]) => void): () => void {
    console.log('[SyncService] subscribeToSubscribers initialized');
    const subscribersRef = collection(firestore, 'subscribers');
    const q = query(subscribersRef, orderBy('joinedAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const subscribers: Subscriber[] = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as Subscriber));
        console.log(`[SyncService] subscribeToSubscribers snapshot update: ${subscribers.length} subscribers`);

        // Update cache
        await db.transaction('rw', db.subscribers, db.metadata, async () => {
            await db.subscribers.clear();
            await db.subscribers.bulkPut(subscribers);
            await updateCacheMetadata('subscribers');
        });

        callback(subscribers);
    });

    return unsubscribe;
}

// Sync blogs from Firestore to Dexie
export async function syncBlogs(force: boolean = false): Promise<BlogPost[]> {
    const cacheKey = 'blogs';
    const isStale = await isCacheStale(cacheKey, 30); // 30 minutes cache

    console.log(`[SyncService] syncBlogs called. force: ${force}, isStale: ${isStale}`);

    // Check if cache is fresh
    if (!force && !isStale) {
        const cachedBlogs = await db.blogs.orderBy('date').reverse().toArray();
        if (cachedBlogs.length > 0) {
            console.log(`[SyncService] Returning ${cachedBlogs.length} cached blogs`);
            // Ensure cached data also has robust defaults applied
            return cachedBlogs.map(blog => mapBlogPost(blog.id, blog));
        }
    }

    // Fetch from Firestore
    console.log('[SyncService] Fetching blogs from Firestore...');
    try {
        const blogsRef = collection(firestore, 'blogs');
        const q = query(blogsRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);

        const blogs: BlogPost[] = snapshot.docs.map(doc => mapBlogPost(doc.id, doc.data()));

        console.log(`[SyncService] Processed ${blogs.length} blogs from Firestore`);

        // Update Dexie cache atomically
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
    console.log('[SyncService] subscribeToBlogs initialized');
    const blogsRef = collection(firestore, 'blogs');
    const q = query(blogsRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const blogs: BlogPost[] = snapshot.docs.map(doc => mapBlogPost(doc.id, doc.data()));
        console.log(`[SyncService] subscribeToBlogs snapshot update: ${blogs.length} blogs`);

        // Update cache
        await db.transaction('rw', db.blogs, db.metadata, async () => {
            await db.blogs.clear();
            await db.blogs.bulkPut(blogs);
            await updateCacheMetadata('blogs');
        });

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

