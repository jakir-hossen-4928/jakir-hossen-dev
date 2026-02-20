import { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { subscribeToUsers } from '@/lib/userService';

export const useUsers = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const unsubscribe = subscribeToUsers(
            (fetchedUsers) => {
                setUsers(fetchedUsers);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error('useUsers hook error:', err);
                setError(err.message || 'Failed to sync users. Check permissions.');
                setIsLoading(false);
            }
        );

        // Handle fallback timeout for general connectivity issues
        const errorTimeout = setTimeout(() => {
            if (isLoading && !error) {
                setError('Failed to load users (Timeout)');
                setIsLoading(false);
            }
        }, 15000); // Increased to 15 seconds

        return () => {
            unsubscribe();
            clearTimeout(errorTimeout);
        };
    }, []);

    return { users, isLoading, error };
};
