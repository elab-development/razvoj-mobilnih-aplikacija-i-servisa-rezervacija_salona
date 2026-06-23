import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import type { Salon } from '@/types/salon';

export type OwnerSalon = Salon & {
  id: string;
};

export type OwnerSalonUpdate = Pick<
  Salon,
  | 'name'
  | 'description'
  | 'category'
  | 'imageUrl'
  | 'location'
  | 'workingHours'
  | 'active'
>;

export function useOwnerSalons(
  ownerId: string | undefined,
  ownerEmail: string | undefined,
) {
  const [salons, setSalons] = useState<OwnerSalon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalons = useCallback(async () => {
    if (!ownerId) {
      setSalons([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const snapshot = await getDocs(
        query(collection(db, 'salons'), where('ownerId', '==', ownerId)),
      );

      setSalons(
        snapshot.docs
          .map((salonDoc) => {
            const data = salonDoc.data() as Partial<Salon> & {
              status?: 'active' | 'inactive';
            };

            return {
              id: salonDoc.id,
              ...data,
              active: data.active ?? data.status === 'active',
              approved: data.approved ?? false,
            } as OwnerSalon;
          })
          .sort((first, second) => first.name.localeCompare(second.name)),
      );
    } catch {
      setError('Unable to load salons. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  const updateSalon = useCallback(
    async (salonId: string, data: OwnerSalonUpdate) => {
      await updateDoc(doc(db, 'salons', salonId), {
        ...data,
        updatedAt: serverTimestamp(),
      });

      setSalons((currentSalons) =>
        currentSalons.map((salon) =>
          salon.id === salonId ? { ...salon, ...data } : salon,
        ),
      );
    },
    [],
  );

  const createSalon = useCallback(
    async (salonId: string, data: OwnerSalonUpdate) => {
      if (!ownerId || !ownerEmail) {
        throw new Error('Missing owner profile.');
      }

      const normalizedOwnerEmail = ownerEmail.trim().toLowerCase();
      const newSalon: OwnerSalon = {
        id: salonId,
        ...data,
        ownerId,
        ownerEmail: normalizedOwnerEmail,
        approved: false,
      };

      await setDoc(doc(db, 'salons', salonId), {
        ...data,
        ownerId,
        ownerEmail: normalizedOwnerEmail,
        approved: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSalons((currentSalons) =>
        [...currentSalons, newSalon].sort((first, second) =>
          first.name.localeCompare(second.name),
        ),
      );
    },
    [ownerEmail, ownerId],
  );

  return {
    salons,
    isLoading,
    error,
    refetch: fetchSalons,
    createSalon,
    updateSalon,
  };
}
