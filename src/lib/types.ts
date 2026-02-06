export interface AppEntry {
    id: string;
    slug: string;
    status: 'testing' | 'production';
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
    timestamp: any; // Using any to handle both Firestore Timestamp and Date seamlessly
}
