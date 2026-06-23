import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'owner' | 'user';

export type RegistrationRole = Exclude<UserRole, 'admin'>;

export type UserProfile = {
  email: string;
  name: string;
  role: UserRole;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
