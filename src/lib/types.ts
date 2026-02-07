export type AppStatus = 'production' | 'testing';
export type BlogStatus = 'published' | 'draft';
export type UserRole = 'user' | 'admin';

export interface AppEntry {
    id: string;
    slug: string;
    status: AppStatus;
    playStoreUrl: string;
    apkUrl?: string;
    appName: string;
    description: string;
    icon?: string;
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

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    createdAt?: string;
    lastSignIn?: string;
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

export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    isPinned?: boolean;
}

export interface RoleChangeLog {
    id: string;
    targetUserId: string;
    targetUserEmail: string;
    adminId: string;
    adminEmail: string;
    oldRole: UserRole;
    newRole: UserRole;
    timestamp: string;
}

export interface BookmarkFolder {
    id: string;
    name: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface BookmarkLink {
    id: string;
    title: string;
    url: string;
    folderId: string | null;
    createdAt: string;
    updatedAt: string;
}
