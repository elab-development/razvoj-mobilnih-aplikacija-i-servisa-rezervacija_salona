import type { UserRole } from '@/types/user';

export function getDefaultAppRoute(role: UserRole | undefined) {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'owner':
      return '/owner';
    default:
      return '/home';
  }
}
