import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { db } from '@/lib/firebase';
import type { FavoriteSalon } from '@/types/favorite';

export function useFavoriteSalons(userId: string | undefined) {
  const [favoriteSalonIds, setFavoriteSalonIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const favoriteSet = useMemo(
    () => new Set(favoriteSalonIds),
    [favoriteSalonIds],
  );

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavoriteSalonIds([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const snapshot = await getDocs(
        query(collection(db, 'favorites'), where('userId', '==', userId)),
      );

      setFavoriteSalonIds(
        snapshot.docs.map((favoriteDoc) => {
          const data = favoriteDoc.data() as FavoriteSalon;
          return data.salonId;
        }),
      );
    } catch {
      setError('Unable to load favorites.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setFavoriteSalonIds([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      query(collection(db, 'favorites'), where('userId', '==', userId)),
      (snapshot) => {
        setFavoriteSalonIds(
          snapshot.docs.map((favoriteDoc) => {
            const data = favoriteDoc.data() as FavoriteSalon;
            return data.salonId;
          }),
        );
        setIsLoading(false);
      },
      () => {
        setError('Unable to load favorites.');
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  const toggleFavorite = useCallback(
    async (salonId: string) => {
      if (!userId) {
        throw new Error('Missing user id.');
      }

      const favoriteId = getFavoriteId(userId, salonId);
      const favoriteRef = doc(db, 'favorites', favoriteId);
      const isFavorite = favoriteSet.has(salonId);

      if (isFavorite) {
        await deleteDoc(favoriteRef);
        setFavoriteSalonIds((current) =>
          current.filter((currentSalonId) => currentSalonId !== salonId),
        );
        return;
      }

      await setDoc(favoriteRef, {
        userId,
        salonId,
        createdAt: serverTimestamp(),
      });
      setFavoriteSalonIds((current) => [...current, salonId]);
    },
    [favoriteSet, userId],
  );

  return {
    favoriteSalonIds,
    favoriteSet,
    isLoading,
    error,
    refetch: fetchFavorites,
    toggleFavorite,
  };
}

function getFavoriteId(userId: string, salonId: string) {
  return `${userId}_${salonId}`;
}
