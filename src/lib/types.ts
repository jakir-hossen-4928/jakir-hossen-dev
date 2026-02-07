export type AppStatus = 'production' | 'testing';
export type BlogStatus = 'published' | 'draft';

export interface AppEntry {
    id: string;
    slug: string;
    status: AppStatus;
    playStoreUrl: string;
    apkUrl?: string;
    appName: string;
    description: string;
    icon?: string;
    coverPhoto?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Tester {
    uid: string;
    email: string;
    playStoreEmail?: string;
    displayName: string;
    joinedAt: string;
    appId?: string;
}

export interface Comment {
    id: string;
    appId: string;
    userId: string;
    displayName: string;
    content: string;
    timestamp: Date | { toDate?: () => Date; seconds?: number; nanoseconds?: number };
}

export interface Subscriber {
    uid: string;
    email: string;
    joinedAt: string;
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    date: string;
    categories: string[];
    description: string;
    excerpt?: string;
    status: BlogStatus;
    author?: string;
    thumbnailColor?: string;
    createdAt: string;
    updatedAt: string;
}
