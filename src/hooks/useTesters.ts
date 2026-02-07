import { useQuery, useQueryClient } from '@tanstack/react-query';
import { syncTesters, subscribeToTesters } from '@/lib/syncService';
import { db } from '@/lib/db';
import { useEffect } from 'react';

export function useTesters() {
    const queryClient = useQueryClient();

    const { data: testers = [], isLoading, error } = useQuery({
        queryKey: ['testers'],
        queryFn: async () => {
            const localTesters = await db.testers.toArray();
            return await syncTesters(localTesters.length === 0);
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    useEffect(() => {
        const unsubscribe = subscribeToTesters((updatedTesters) => {
            queryClient.setQueryData(['testers'], updatedTesters);
        });
        return () => unsubscribe();
    }, [queryClient]);

    return {
        testers,
        isLoading,
        error
    };
}
