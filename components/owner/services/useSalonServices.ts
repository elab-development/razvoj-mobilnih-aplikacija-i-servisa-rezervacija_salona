import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import type { Service } from '@/types/salon';

export type OwnerService = Service & {
  id: string;
};

export type SalonServicePayload = Pick<
  Service,
  | 'name'
  | 'description'
  | 'priceRsd'
  | 'durationMinutes'
  | 'slotIntervalMinutes'
  | 'availableTimeSlots'
  | 'status'
>;

export function useSalonServices(salonId: string | undefined) {
  const [services, setServices] = useState<OwnerService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    if (!salonId) {
      setServices([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const snapshot = await getDocs(
        query(collection(db, 'services'), where('salonId', '==', salonId)),
      );

      setServices(
        snapshot.docs
          .map((serviceDoc) => ({
            id: serviceDoc.id,
            ...(serviceDoc.data() as Service),
          }))
          .sort((first, second) => first.name.localeCompare(second.name)),
      );
    } catch {
      setError('Unable to load services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = useCallback(
    async (data: SalonServicePayload) => {
      if (!salonId) {
        throw new Error('Missing salon id.');
      }

      const serviceRef = await addDoc(collection(db, 'services'), {
        ...data,
        salonId,
        currency: 'RSD',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newService: OwnerService = {
        id: serviceRef.id,
        salonId,
        currency: 'RSD',
        ...data,
      };

      setServices((currentServices) =>
        [...currentServices, newService]
          .sort((first, second) => first.name.localeCompare(second.name)),
      );
    },
    [salonId],
  );

  const updateService = useCallback(
    async (serviceId: string, data: SalonServicePayload) => {
      await updateDoc(doc(db, 'services', serviceId), {
        ...data,
        updatedAt: serverTimestamp(),
      });

      setServices((currentServices) =>
        currentServices
          .map((service) =>
            service.id === serviceId ? { ...service, ...data } : service,
          )
          .sort((first, second) => first.name.localeCompare(second.name)),
      );
    },
    [],
  );

  return {
    services,
    isLoading,
    error,
    refetch: fetchServices,
    createService,
    updateService,
  };
}
