import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { db } from '@/lib/firebase';
import type { Booking } from '@/types/booking';

export type OwnerBooking = Booking & {
  id: string;
};

export type OwnerBookingGroup = {
  salonId: string;
  salonName: string;
  bookings: OwnerBooking[];
};

export function useOwnerBookings(ownerId: string | undefined) {
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!ownerId) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const snapshot = await getDocs(
        query(collection(db, 'bookings'), where('ownerId', '==', ownerId)),
      );

      setBookings(
        sortOwnerBookings(
          snapshot.docs.map((bookingDoc) => ({
            id: bookingDoc.id,
            ...(bookingDoc.data() as Booking),
          })),
        ),
      );
    } catch {
      setError('Unable to load owner bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    if (!ownerId) {
      setBookings([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      query(collection(db, 'bookings'), where('ownerId', '==', ownerId)),
      (snapshot) => {
        setBookings(
          sortOwnerBookings(
            snapshot.docs.map((bookingDoc) => ({
              id: bookingDoc.id,
              ...(bookingDoc.data() as Booking),
            })),
          ),
        );
        setIsLoading(false);
      },
      () => {
        setError('Unable to load owner bookings. Please try again.');
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [ownerId]);

  const confirmedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'confirmed'),
    [bookings],
  );

  const upcomingBookings = useMemo(
    () =>
      confirmedBookings.filter(
        (booking) => getBookingDateTime(booking).getTime() >= Date.now(),
      ),
    [confirmedBookings],
  );

  const completedBookings = useMemo(
    () =>
      confirmedBookings.filter(
        (booking) => getBookingDateTime(booking).getTime() < Date.now(),
      ),
    [confirmedBookings],
  );

  const upcomingGroups = useMemo(
    () => groupBookingsBySalon(upcomingBookings),
    [upcomingBookings],
  );

  return {
    bookings,
    upcomingBookings,
    completedBookings,
    upcomingGroups,
    isLoading,
    error,
    refetch: fetchBookings,
  };
}

export function formatOwnerBookingDate(booking: Booking) {
  return getBookingDateTime(booking).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function sortOwnerBookings(bookings: OwnerBooking[]) {
  return [...bookings].sort(
    (first, second) =>
      getBookingDateTime(first).getTime() - getBookingDateTime(second).getTime(),
  );
}

function groupBookingsBySalon(bookings: OwnerBooking[]) {
  const groups = new Map<string, OwnerBookingGroup>();

  bookings.forEach((booking) => {
    const group = groups.get(booking.salonId);

    if (group) {
      group.bookings.push(booking);
      return;
    }

    groups.set(booking.salonId, {
      salonId: booking.salonId,
      salonName: booking.salonName,
      bookings: [booking],
    });
  });

  return Array.from(groups.values());
}

function getBookingDateTime(booking: Booking) {
  return new Date(`${booking.date}T${booking.startsAt}:00`);
}
