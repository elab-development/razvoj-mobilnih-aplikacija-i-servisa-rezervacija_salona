import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import type { Salon } from '@/types/salon';

export type AvailableSalon = Salon & {
  id: string;
  distanceKm?: number;
};

export function useAvailableSalons() {
  const [salons, setSalons] = useState<AvailableSalon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalons = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'salons'),
          where('active', '==', true),
          where('approved', '==', true),
        ),
      );

      setSalons(
        snapshot.docs
          .map((salonDoc) => ({
            id: salonDoc.id,
            ...(salonDoc.data() as Salon),
          }))
          .sort((first, second) => first.name.localeCompare(second.name)),
      );
    } catch {
      setError('Unable to load salons. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  return {
    salons,
    isLoading,
    error,
    refetch: fetchSalons,
  };
}
