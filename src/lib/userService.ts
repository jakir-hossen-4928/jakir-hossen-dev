import { collection, doc, updateDoc, getDocs, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, UserRole, RoleChangeLog } from './types';
import { toast } from 'sonner';

/**
 * Get all users from Firestore
 * Only accessible by admins (enforced by security rules)
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);

        return snapshot.docs.map(doc => ({
            ...doc.data(),
            uid: doc.id,
        } as UserProfile));
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users. You may not have permission.');
    }
};

/**
 * Subscribe to real-time user updates
 * @param callback Function to call when users change
 * @returns Unsubscribe function
 */
export const subscribeToUsers = (callback: (users: UserProfile[]) => void): (() => void) => {
    const usersRef = collection(db, 'users');

    return onSnapshot(
        usersRef,
        (snapshot) => {
            const users = snapshot.docs.map(doc => ({
                ...doc.data(),
                uid: doc.id,
            } as UserProfile));
            callback(users);
        },
        (error) => {
            console.error('Error in users subscription:', error);
            toast.error('Failed to sync users');
        }
    );
};

/**
 * Update a user's role
 * Includes client-side validation and audit logging
 * @param targetUserId User ID to update
 * @param newRole New role to assign
 * @param currentAdminId Current admin's user ID
 * @param currentAdminEmail Current admin's email
 */
export const updateUserRole = async (
    targetUserId: string,
    newRole: UserRole,
    currentAdminId: string,
    currentAdminEmail: string,
    targetUserEmail: string,
    oldRole: UserRole
): Promise<void> => {
    // Client-side validation
    if (!targetUserId || !newRole) {
        throw new Error('Invalid parameters');
    }

    if (newRole !== 'user' && newRole !== 'admin') {
        throw new Error('Invalid role. Must be "user" or "admin"');
    }

    // Prevent self-demotion
    if (targetUserId === currentAdminId) {
        throw new Error('You cannot change your own role');
    }

    try {
        const userRef = doc(db, 'users', targetUserId);

        // Update the user's role
        await updateDoc(userRef, {
            role: newRole,
        });

        // Log the role change for audit trail
        await logRoleChange({
            targetUserId,
            targetUserEmail,
            adminId: currentAdminId,
            adminEmail: currentAdminEmail,
            oldRole,
            newRole,
        });

        toast.success(`User role updated to ${newRole}`);
    } catch (error: any) {
        console.error('Error updating user role:', error);

        // Provide specific error messages
        if (error.code === 'permission-denied') {
            throw new Error('You do not have permission to update user roles');
        } else if (error.message?.includes('cannot change your own role')) {
            throw new Error(error.message);
        } else {
            throw new Error('Failed to update user role');
        }
    }
};

/**
 * Log role changes for audit trail
 */
const logRoleChange = async (log: Omit<RoleChangeLog, 'id' | 'timestamp'>): Promise<void> => {
    try {
        const logsRef = collection(db, 'roleChanges');
        await addDoc(logsRef, {
            ...log,
            timestamp: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error logging role change:', error);
        // Don't throw - logging failure shouldn't prevent role update
    }
};

/**
 * Get role change logs (for admin audit view)
 */
export const getRoleChangeLogs = async (): Promise<RoleChangeLog[]> => {
    try {
        const logsRef = collection(db, 'roleChanges');
        const snapshot = await getDocs(logsRef);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as RoleChangeLog));
    } catch (error) {
        console.error('Error fetching role change logs:', error);
        return [];
    }
};
