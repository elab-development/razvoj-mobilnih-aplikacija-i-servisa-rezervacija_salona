import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import {
  sortUserBookings,
  type UserBooking,
} from '@/components/bookings/bookingSort';
import { db } from '@/lib/firebase';
import type { Booking } from '@/types/booking';

export function useUserBookings(userId: string | undefined) {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!userId) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const snapshot = await getDocs(
        query(collection(db, 'bookings'), where('userId', '==', userId)),
      );

      setBookings(
        sortUserBookings(
          snapshot.docs.map((bookingDoc) => ({
            id: bookingDoc.id,
            ...(bookingDoc.data() as Booking),
          })),
        ),
      );
    } catch {
      setError('Unable to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setBookings([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      query(collection(db, 'bookings'), where('userId', '==', userId)),
      (snapshot) => {
        setBookings(
          sortUserBookings(
            snapshot.docs.map((bookingDoc) => ({
              id: bookingDoc.id,
              ...(bookingDoc.data() as Booking),
            })),
          ),
        );
        setIsLoading(false);
      },
      () => {
        setError('Unable to load bookings. Please try again.');
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });

    setBookings((currentBookings) =>
      sortUserBookings(
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking,
        ),
      ),
    );
  }, []);

  return {
    bookings,
    isLoading,
    error,
    refetch: fetchBookings,
    cancelBooking,
  };
}
