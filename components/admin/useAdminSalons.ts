import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import type { Salon } from '@/types/salon';

export type AdminSalon = Salon & {
  id: string;
};

export function useAdminSalons() {
  const [salons, setSalons] = useState<AdminSalon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalons = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const snapshot = await getDocs(collection(db, 'salons'));

      setSalons(sortSalons(
        snapshot.docs.map((salonDoc) => {
          const data = salonDoc.data() as Partial<Salon> & {
            status?: 'active' | 'inactive';
          };

          return {
            id: salonDoc.id,
            ...data,
            active: data.active ?? data.status === 'active',
            approved: data.approved ?? false,
          } as AdminSalon;
        }),
      ));
    } catch {
      setError('Unable to load salons. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  const approveSalon = useCallback(async (salonId: string) => {
    await updateDoc(doc(db, 'salons', salonId), {
      approved: true,
      updatedAt: serverTimestamp(),
    });

    setSalons((currentSalons) =>
      sortSalons(
        currentSalons.map((salon) =>
          salon.id === salonId ? { ...salon, approved: true } : salon,
        ),
      ),
    );
  }, []);

  return {
    salons,
    isLoading,
    error,
    refetch: fetchSalons,
    approveSalon,
  };
}

function sortSalons(salons: AdminSalon[]) {
  return [...salons].sort((first, second) => {
    if (first.approved !== second.approved) {
      return first.approved ? 1 : -1;
    }

    return first.name.localeCompare(second.name);
  });
}
