import { useQuery, useQueryClient } from '@tanstack/react-query';
import { syncApps, subscribeToApps } from '@/lib/syncService';
import { db } from '@/lib/db';
import { AppEntry } from '@/lib/types';
import { useEffect } from 'react';

export function useApps() {
    const queryClient = useQueryClient();

    const { data: apps = [], isLoading, error, refetch } = useQuery({
        queryKey: ['apps'],
        queryFn: async () => {
            const localApps = await db.apps.toArray();
            return await syncApps(localApps.length === 0);
        },
        staleTime: 1000 * 60 * 15, // 15 minutes
    });

    useEffect(() => {
        const unsubscribe = subscribeToApps((updatedApps) => {
            queryClient.setQueryData(['apps'], updatedApps);
        });
        return () => unsubscribe();
    }, [queryClient]);

    return {
        apps,
        isLoading,
        error,
        refetch
    };
}

export function useAppBySlug(slug: string | undefined) {
    const { apps, isLoading } = useApps();
    const app = apps.find(a => a.slug === slug);

    return {
        app,
        isLoading: isLoading && !app
    };
}
