import type { Timestamp } from 'firebase/firestore';

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type SalonCategory = 'beauty' | 'hair' | 'nails' | 'spa';

export type SalonWorkingDay = {
  isOpen: boolean;
  opensAt: string | null;
  closesAt: string | null;
};

export type Salon = {
  name: string;
  description: string;
  category: SalonCategory;
  imageUrl: string;
  ownerId: string;
  ownerEmail: string;
  location: {
    street: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  workingHours: Record<WeekDay, SalonWorkingDay>;
  active: boolean;
  approved: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type Service = {
  salonId: string;
  name: string;
  description: string;
  priceRsd: number;
  currency: 'RSD';
  durationMinutes: number;
  slotIntervalMinutes: number;
  availableTimeSlots: string[];
  status: 'active' | 'inactive';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
