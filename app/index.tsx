import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/roleRoutes';

export default function Index() {
  const { profile, user } = useAuth();

  return <Redirect href={user ? getDefaultAppRoute(profile?.role) : '/login'} />;
}
