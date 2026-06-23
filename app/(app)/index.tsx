import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/roleRoutes';

export default function AppIndex() {
  const { profile } = useAuth();

  return <Redirect href={getDefaultAppRoute(profile?.role)} />;
}
