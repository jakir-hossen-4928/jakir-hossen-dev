import { useQuery, useQueryClient } from '@tanstack/react-query';
import { syncSubscribers, subscribeToSubscribers } from '@/lib/syncService';
import { db } from '@/lib/db';
import { useEffect } from 'react';

export function useSubscribers() {
    const queryClient = useQueryClient();

    const { data: subscribers = [], isLoading, error } = useQuery({
        queryKey: ['subscribers'],
        queryFn: async () => {
            const localSubscribers = await db.subscribers.toArray();
            return await syncSubscribers(localSubscribers.length === 0);
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    useEffect(() => {
        const unsubscribe = subscribeToSubscribers((updatedSubscribers) => {
            queryClient.setQueryData(['subscribers'], updatedSubscribers);
        });
        return () => unsubscribe();
    }, [queryClient]);

    return {
        subscribers,
        isLoading,
        error
    };
}
