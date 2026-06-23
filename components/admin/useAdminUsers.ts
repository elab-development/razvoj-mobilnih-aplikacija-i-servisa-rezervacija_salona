import { collection, getDocs } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/types/user';

export type AdminUser = UserProfile & {
  id: string;
};

const roleOrder: Record<UserRole, number> = {
  admin: 0,
  owner: 1,
  user: 2,
};

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const snapshot = await getDocs(collection(db, 'users'));

      setUsers(
        snapshot.docs
          .map((userDoc) => ({
            id: userDoc.id,
            ...(userDoc.data() as UserProfile),
          }))
          .sort((first, second) => {
            const roleDiff = roleOrder[first.role] - roleOrder[second.role];
            return roleDiff || first.name.localeCompare(second.name);
          }),
      );
    } catch {
      setError('Unable to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
  };
}
