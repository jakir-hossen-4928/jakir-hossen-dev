import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syncBlogs, subscribeToBlogs } from '@/lib/syncService';
import { db } from '@/lib/db';
import { BlogPost } from '@/lib/types';
import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';

export function useBlogs() {
    const queryClient = useQueryClient();

    // Query for blogs
    const { data: blogs = [], isLoading, error, refetch } = useQuery({
        queryKey: ['blogs'],
        queryFn: async () => {
            // First try to get from Dexie
            let localBlogs = await db.blogs.orderBy('date').reverse().toArray();

            // Sync with Firestore in the background or if local is empty
            // syncBlogs returns the latest blogs and updates Dexie
            const syncedBlogs = await syncBlogs(localBlogs.length === 0);
            return syncedBlogs;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Subscriptions for real-time updates
    useEffect(() => {
        const unsubscribe = subscribeToBlogs((updatedBlogs) => {
            queryClient.setQueryData(['blogs'], updatedBlogs);
        });
        return () => unsubscribe();
    }, [queryClient]);

    return {
        blogs,
        isLoading,
        error,
        refetch
    };
}

export function useFilteredBlogs(searchTerm: string, selectedCategory: string | null) {
    const { blogs, isLoading, error } = useBlogs();
    const [filtered, setFiltered] = useState<BlogPost[]>([]);

    useEffect(() => {
        if (!blogs) return;

        let results = [...blogs];

        // 1. Filter by category first (exact match from array)
        if (selectedCategory) {
            results = results.filter(b => b.categories?.includes(selectedCategory));
        }

        // 2. Fuzzy Search with Fuse.js
        if (searchTerm.trim()) {
            const fuse = new Fuse(results, {
                keys: ['title', 'categories', 'excerpt'],
                threshold: 0.3,
                distance: 100,
            });
            results = fuse.search(searchTerm).map(r => r.item);
        }

        // 3. Status filter (ensure only published blogs are shown in gallery)
        // Note: Admin might need a different hook or parameter
        results = results.filter(b => b.status === 'published');

        setFiltered(results);
    }, [blogs, searchTerm, selectedCategory]);

    return {
        blogs: filtered,
        isLoading,
        error
    };
}
