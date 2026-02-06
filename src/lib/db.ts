import Dexie, { Table } from 'dexie';
import { AppEntry, Comment } from '@/lib/types';

export interface CacheMetadata {
    key: string;
    lastSync: Date;
    version: number;
}

export class AppDatabase extends Dexie {
    apps!: Table<AppEntry, string>;
    comments!: Table<Comment, string>;
    metadata!: Table<CacheMetadata, string>;

    constructor() {
        super('AppPromotionDB');

        // Version 1: Initial schema
        this.version(1).stores({
            apps: 'id, slug, appName, category, status, createdAt, updatedAt',
            comments: 'id, appId, userId, timestamp',
            metadata: 'key, lastSync'
        });

        // Version 2: Remove category from indexes, align with new schema
        this.version(2).stores({
            apps: 'id, slug, appName, status, createdAt, updatedAt', // removed category
            comments: 'id, appId, userId, timestamp',
            metadata: 'key, lastSync'
        }).upgrade(tx => {
            // Optional: Data migration if needed, but we typically overwrite cache on sync
            // tx.table('apps').toCollection().modify(app => { delete app.category; });
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
