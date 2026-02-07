import Dexie, { Table } from 'dexie';
import { AppEntry, Comment, Tester, Subscriber, BlogPost, Note } from '@/lib/types';

export interface CacheMetadata {
    key: string;
    lastSync: Date;
    version: number;
}

export class AppDatabase extends Dexie {
    apps!: Table<AppEntry, string>;
    comments!: Table<Comment, string>;
    testers!: Table<Tester, string>;
    subscribers!: Table<Subscriber, string>;
    blogs!: Table<BlogPost, string>;
    notes!: Table<Note, string>;
    metadata!: Table<CacheMetadata, string>;

    constructor() {
        super('portfolioApp');

        // Version 1: Initial schema
        this.version(1).stores({
            apps: 'id, slug, appName, status, createdAt, updatedAt',
            comments: 'id, appId, userId, timestamp',
            metadata: 'key, lastSync'
        });

        // Version 2: Remove category from indexes
        this.version(2).stores({
            apps: 'id, slug, appName, status, createdAt, updatedAt',
            comments: 'id, appId, userId, timestamp',
            metadata: 'key, lastSync'
        });

        // Version 3: Add testers and subscribers
        this.version(3).stores({
            apps: 'id, slug, appName, status, createdAt, updatedAt',
            comments: 'id, appId, userId, timestamp',
            testers: 'uid, email, displayName, joinedAt',
            subscribers: 'uid, email, joinedAt',
            metadata: 'key, lastSync'
        });

        // Version 4: Add blogs
        this.version(4).stores({
            apps: 'id, slug, appName, status, createdAt, updatedAt',
            comments: 'id, appId, userId, timestamp',
            testers: 'uid, email, displayName, joinedAt',
            subscribers: 'uid, email, joinedAt',
            blogs: 'id, slug, title, date, *categories, status',
            metadata: 'key, lastSync'
        });

        // Version 5: Robust indexing for sorting components
        this.version(5).stores({
            apps: 'id, slug, appName, status, createdAt, updatedAt',
            comments: 'id, appId, userId, timestamp',
            testers: 'uid, email, displayName, joinedAt',
            subscribers: 'uid, email, joinedAt',
            blogs: 'id, slug, title, date, status',
            metadata: 'key, lastSync'
        });

        // Version 6: Add notes
        this.version(6).stores({
            apps: 'id, slug, appName, status, createdAt, updatedAt',
            comments: 'id, appId, userId, timestamp',
            testers: 'uid, email, displayName, joinedAt',
            subscribers: 'uid, email, joinedAt',
            blogs: 'id, slug, title, date, status',
            notes: 'id, title, createdAt, *tags, isPinned',
            metadata: 'key, lastSync'
        });
    }
}

export const db = new AppDatabase();

// Helper to check if cache is stale (older than 5 minutes)
export async function isCacheStale(key: string, maxAgeMinutes: number = 5): Promise<boolean> {
    const meta = await db.metadata.get(key);
    if (!meta) return true;

    const now = new Date();
    const ageMinutes = (now.getTime() - meta.lastSync.getTime()) / 1000 / 60;
    return ageMinutes > maxAgeMinutes;
}

// Helper to update cache metadata
export async function updateCacheMetadata(key: string): Promise<void> {
    await db.metadata.put({
        key,
        lastSync: new Date(),
        version: 1
    });
}

// Helper to get cached testers
export async function getCachedTesters(): Promise<Tester[]> {
    return await db.testers.orderBy('joinedAt').reverse().toArray();
}

// Helper to get cached subscribers
export async function getCachedSubscribers(): Promise<Subscriber[]> {
    return await db.subscribers.orderBy('joinedAt').reverse().toArray();
}

// Helper to get cached blogs
export async function getCachedBlogs(): Promise<BlogPost[]> {
    return await db.blogs.orderBy('date').reverse().toArray();
}

// Helper to get cached notes
export async function getCachedNotes(): Promise<Note[]> {
    return await db.notes.orderBy('createdAt').reverse().toArray();
}
