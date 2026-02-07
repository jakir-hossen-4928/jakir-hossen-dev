import { useQuery, useQueryClient } from '@tanstack/react-query';
import { syncComments, subscribeToComments as subscribeToRemoteComments } from '@/lib/syncService';
import { Comment } from '@/lib/types';
import { useEffect } from 'react';

export function useComments(appId: string | undefined) {
    const queryClient = useQueryClient();

    const { data: comments = [], isLoading, error } = useQuery({
        queryKey: ['comments', appId],
        queryFn: async () => {
            if (!appId) return [];
            return await syncComments(appId);
        },
        enabled: !!appId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    useEffect(() => {
        if (!appId) return;

        const unsubscribe = subscribeToRemoteComments(appId, (updatedComments) => {
            queryClient.setQueryData(['comments', appId], updatedComments);
        });
        return () => unsubscribe();
    }, [appId, queryClient]);

    return {
        comments,
        isLoading,
        error
    };
}
