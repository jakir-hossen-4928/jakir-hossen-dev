import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { syncThemes, subscribeToThemes, deleteTheme, addTheme, updateTheme } from '@/lib/syncService';
import { db } from '@/lib/db';
import { WebTheme, ThemeCategory } from '@/lib/types';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { THEME_CATEGORIES } from '@/lib/constants';

// Query keys for consistent cache management
export const themeKeys = {
    all: ['themes'] as const,
    lists: () => [...themeKeys.all, 'list'] as const,
    list: (filters: string) => [...themeKeys.lists(), { filters }] as const,
    details: () => [...themeKeys.all, 'detail'] as const,
    detail: (id: string) => [...themeKeys.details(), id] as const,
};

/**
 * Optimized hook for fetching all themes
 * Uses DSA: Hash-based O(1) lookup with Map caching
 * TanStack Query: Caching, background refetching, stale-while-revalidate
 */
export function useWebThemes() {
    const queryClient = useQueryClient();
    const [realtimeEnabled, setRealtimeEnabled] = useState(true);

    const { data, isLoading, error, refetch } = useQuery<WebTheme[]>({
        queryKey: themeKeys.lists(),
        queryFn: async () => {
            console.log('[useWebThemes] Querying themes...');
            const localThemes = await db.themes.toArray();
            try {
                const syncedThemes = await syncThemes(localThemes.length === 0);
                return syncedThemes;
            } catch (err: any) {
                if (err?.code === 'permission-denied') {
                    console.warn('[useWebThemes] Permission denied, using local themes');
                    setRealtimeEnabled(false);
                    return localThemes;
                }
                throw err;
            }
        },
        staleTime: 1000 * 60 * 15, // 15 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });

    // Create memoized Map for O(1) theme lookup by ID
    const themesMap = useMemo(() => {
        const map = new Map<string, WebTheme>();
        data?.forEach(theme => map.set(theme.id, theme));
        return map;
    }, [data]);

    const themes = useMemo(() => data || [], [data]);

    // Real-time subscription with error handling
    useEffect(() => {
        if (!realtimeEnabled) return;
        
        const unsubscribe = subscribeToThemes(
            (updatedThemes) => {
                console.log(`[useWebThemes] Real-time update: ${updatedThemes.length} themes`);
                queryClient.setQueryData(themeKeys.lists(), updatedThemes);
            },
            (error) => {
                if (error?.code === 'permission-denied') {
                    console.warn('[useWebThemes] Real-time subscription denied');
                    setRealtimeEnabled(false);
                }
            }
        );
        return () => unsubscribe();
    }, [queryClient, realtimeEnabled]);

    return {
        themes,
        themesMap, // O(1) lookup Map
        isLoading,
        error,
        refetch
    };
}

/**
 * Optimized hook for single theme lookup
 * DSA: Uses Map from parent hook for O(1) access instead of O(n) find
 */
export function useWebThemeById(id: string | undefined) {
    const { themesMap, isLoading } = useWebThemes();
    
    const theme = useMemo(() => {
        if (!id) return undefined;
        return themesMap.get(id);
    }, [id, themesMap]);

    return {
        theme,
        isLoading: isLoading && !theme
    };
}

/**
 * Hook for filtered themes with efficient algorithms
 * DSA: Filter with early termination, memoized results
 */
export function useFilteredThemes(
    themes: WebTheme[],
    searchQuery: string,
    categoryFilter: string
) {
    return useMemo(() => {
        // Early return for empty filters
        if (!searchQuery && categoryFilter === 'all') {
            return themes;
        }

        const query = searchQuery.toLowerCase().trim();
        
        return themes.filter((theme) => {
            // Category filter first (cheapest check)
            if (categoryFilter !== 'all' && theme.category !== categoryFilter) {
                return false;
            }
            
            // Search query check
            if (!query) return true;
            
            // Early termination: check name first (most likely match)
            if (theme.name.toLowerCase().includes(query)) return true;
            
            // Check description
            if (theme.description.toLowerCase().includes(query)) return true;
            
            // Check tags (array iteration)
            return theme.tags.some(tag => tag.toLowerCase().includes(query));
        });
    }, [themes, searchQuery, categoryFilter]);
}

/**
 * Hook for theme categories (local data)
 */
export function useThemeCategories() {
    return useMemo(() => ({
        categories: THEME_CATEGORIES,
        isLoading: false,
        error: null
    }), []);
}

/**
 * Hook for theme mutations (admin operations)
 * TanStack Query: Optimistic updates, error rollback
 */
export function useThemeMutations() {
    const queryClient = useQueryClient();

    // Create theme mutation
    const createMutation = useMutation({
        mutationFn: async (theme: Omit<WebTheme, 'id' | 'createdAt' | 'updatedAt'>) => {
            const id = await addTheme(theme);
            return { ...theme, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as WebTheme;
        },
        onSuccess: (newTheme) => {
            queryClient.setQueryData<WebTheme[]>(themeKeys.lists(), (old = []) => 
                [newTheme, ...old]
            );
        },
    });

    // Update theme mutation with optimistic update
    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<WebTheme> }) => {
            await updateTheme(id, updates);
            return { id, updates };
        },
        onMutate: async ({ id, updates }) => {
            await queryClient.cancelQueries({ queryKey: themeKeys.lists() });
            const previousThemes = queryClient.getQueryData<WebTheme[]>(themeKeys.lists());
            
            queryClient.setQueryData<WebTheme[]>(themeKeys.lists(), (old = []) =>
                old.map(theme => theme.id === id ? { ...theme, ...updates, updatedAt: new Date().toISOString() } : theme)
            );
            
            return { previousThemes };
        },
        onError: (err, variables, context) => {
            if (context?.previousThemes) {
                queryClient.setQueryData(themeKeys.lists(), context.previousThemes);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
        },
    });

    // Delete theme mutation with optimistic update
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await deleteTheme(id);
            return id;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: themeKeys.lists() });
            const previousThemes = queryClient.getQueryData<WebTheme[]>(themeKeys.lists());
            
            queryClient.setQueryData<WebTheme[]>(themeKeys.lists(), (old = []) =>
                old.filter(theme => theme.id !== id)
            );
            
            return { previousThemes };
        },
        onError: (err, id, context) => {
            if (context?.previousThemes) {
                queryClient.setQueryData(themeKeys.lists(), context.previousThemes);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
        },
    });

    return {
        createTheme: createMutation.mutateAsync,
        updateTheme: updateMutation.mutateAsync,
        deleteTheme: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
