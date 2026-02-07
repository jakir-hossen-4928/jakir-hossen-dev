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

        const unsubscribe = subscribeToUsers((fetchedUsers) => {
            setUsers(fetchedUsers);
            setIsLoading(false);
        });

        // Handle errors
        const errorTimeout = setTimeout(() => {
            if (isLoading) {
                setError('Failed to load users');
                setIsLoading(false);
            }
        }, 10000); // 10 second timeout

        return () => {
            unsubscribe();
            clearTimeout(errorTimeout);
        };
    }, []);

    return { users, isLoading, error };
};
