import { useQuery, useQueryClient } from '@tanstack/react-query';
import { syncApps, subscribeToApps } from '@/lib/syncService';
import { db } from '@/lib/db';
import { AppEntry } from '@/lib/types';
import { useEffect } from 'react';

export function useApps() {
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery<AppEntry[]>({
        queryKey: ['apps'],
        queryFn: async () => {
            console.log('[useApps] Querying apps...');
            const localApps = await db.apps.toArray();
            console.log(`[useApps] Local apps count: ${localApps.length}`);
            const syncedApps = await syncApps(localApps.length === 0);
            console.log(`[useApps] Synced apps count: ${syncedApps.length}`);
            return syncedApps;
        },
        staleTime: 1000 * 60 * 15, // 15 minutes
    });

    const apps = data || [];

    useEffect(() => {
        const unsubscribe = subscribeToApps((updatedApps) => {
            console.log(`[useApps] Real-time app update received: ${updatedApps.length} apps`);
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
