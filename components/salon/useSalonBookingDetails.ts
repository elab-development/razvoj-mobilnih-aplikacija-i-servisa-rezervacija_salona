import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import type { Booking, BookingPayload } from '@/types/booking';
import type { Salon, Service } from '@/types/salon';

export type BookableSalon = Salon & {
  id: string;
};

export type BookableService = Service & {
  id: string;
};

export function useSalonBookingDetails(salonId: string | undefined) {
  const [salon, setSalon] = useState<BookableSalon | null>(null);
  const [services, setServices] = useState<BookableService[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!salonId) {
      setSalon(null);
      setServices([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const salonSnapshot = await getDoc(doc(db, 'salons', salonId));

      if (!salonSnapshot.exists()) {
        setError('Salon was not found.');
        setSalon(null);
        setServices([]);
        return;
      }

      const salonData = salonSnapshot.data() as Salon;

      if (!salonData.active || !salonData.approved) {
        setError('This salon is not available for booking yet.');
        setSalon(null);
        setServices([]);
        return;
      }

      const servicesSnapshot = await getDocs(
        query(collection(db, 'services'), where('salonId', '==', salonId)),
      );

      setSalon({ id: salonSnapshot.id, ...salonData });
      setServices(
        servicesSnapshot.docs
          .map((serviceDoc) => ({
            id: serviceDoc.id,
            ...(serviceDoc.data() as Service),
          }))
          .filter((service) => service.status === 'active')
          .sort((first, second) => first.name.localeCompare(second.name)),
      );
    } catch {
      setError('Unable to load salon details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [salonId]);

  const fetchBookings = useCallback(async () => {
    if (!salonId) {
      setBookings([]);
      return;
    }

    setBookingsLoading(true);

    try {
      const snapshot = await getDocs(
        query(collection(db, 'bookings'), where('salonId', '==', salonId)),
      );

      setBookings(
        snapshot.docs
          .map((bookingDoc) => bookingDoc.data() as Booking)
          .filter((booking) => booking.status !== 'cancelled'),
      );
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = useCallback(
    async (data: BookingPayload) => {
      await addDoc(collection(db, 'bookings'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await fetchBookings();
    },
    [fetchBookings],
  );

  return {
    salon,
    services,
    bookings,
    isLoading,
    bookingsLoading,
    error,
    refetch: fetchDetails,
    createBooking,
  };
}
