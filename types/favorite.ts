import type { Timestamp } from 'firebase/firestore';

export type FavoriteSalon = {
  userId: string;
  salonId: string;
  createdAt?: Timestamp;
};
