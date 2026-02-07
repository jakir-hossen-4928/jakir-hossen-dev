import { useQuery, useQueryClient } from '@tanstack/react-query';
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
            console.log('[useBlogs] Querying blogs...');
            // First try to get from Dexie
            let localBlogs = await db.blogs.orderBy('date').reverse().toArray();
            console.log(`[useBlogs] Local blogs count: ${localBlogs.length}`);

            // Sync with Firestore in the background or if local is empty
            const syncedBlogs = await syncBlogs(localBlogs.length === 0);
            console.log(`[useBlogs] Synced blogs count: ${syncedBlogs.length}`);
            return syncedBlogs;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Subscriptions for real-time updates
    useEffect(() => {
        const unsubscribe = subscribeToBlogs((updatedBlogs) => {
            console.log(`[useBlogs] Real-time blog update received: ${updatedBlogs.length} articles`);
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
        console.log(`[useFilteredBlogs] Filtering blogs. Total: ${blogs.length}, Search: "${searchTerm}", Category: "${selectedCategory}"`);
        if (!blogs) return;

        let results = [...blogs];

        // 1. Filter by category first (exact match from array)
        if (selectedCategory) {
            results = results.filter(b => b.categories?.includes(selectedCategory));
            console.log(`[useFilteredBlogs] After category filter: ${results.length}`);
        }

        // 2. Fuzzy Search with Fuse.js
        if (searchTerm.trim()) {
            const fuse = new Fuse(results, {
                keys: ['title', 'categories', 'excerpt'],
                threshold: 0.3,
                distance: 100,
            });
            results = fuse.search(searchTerm).map(r => r.item);
            console.log(`[useFilteredBlogs] After fuzzy search: ${results.length}`);
        }

        // 3. Status filter (ensure relevant blogs are shown)
        results = results.filter(b =>
            !b.status ||
            b.status.toLowerCase() === 'published' ||
            b.status.toLowerCase() === 'draft'
        );
        console.log(`[useFilteredBlogs] After status filter: ${results.length}`);

        setFiltered(results);
    }, [blogs, searchTerm, selectedCategory]);

    return {
        blogs: filtered,
        isLoading,
        error
    };
}
