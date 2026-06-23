import type { Timestamp } from 'firebase/firestore';

export type BookingStatus = 'confirmed' | 'cancelled';

export type Booking = {
  userId: string;
  userName: string;
  userEmail: string;
  salonId: string;
  salonName: string;
  ownerId: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startsAt: string;
  endsAt: string;
  priceRsd: number;
  currency: 'RSD';
  status: BookingStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type BookingPayload = Omit<Booking, 'createdAt' | 'updatedAt'>;
