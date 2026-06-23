import { Redirect } from 'expo-router';
import { useState } from 'react';

import { AdminSalonsTab } from '@/components/admin/AdminSalonsTab';
import { AdminTabs, type AdminTab } from '@/components/admin/AdminTabs';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { useAdminSalons } from '@/components/admin/useAdminSalons';
import { useAdminUsers } from '@/components/admin/useAdminUsers';
import { AppScreenLayout } from '@/components/AppScreenLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/roleRoutes';

export default function AdminScreen() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const usersState = useAdminUsers();
  const salonsState = useAdminSalons();

  if (profile?.role !== 'admin') {
    return <Redirect href={getDefaultAppRoute(profile?.role)} />;
  }

  const pendingSalonCount = salonsState.salons.filter(
    (salon) => !salon.approved,
  ).length;

  return (
    <AppScreenLayout
      title="Admin"
      subtitle="Review users and approve salons before they appear to clients."
    >
      <AdminTabs
        activeTab={activeTab}
        userCount={usersState.users.length}
        salonCount={salonsState.salons.length}
        pendingSalonCount={pendingSalonCount}
        onChange={setActiveTab}
      />

      {activeTab === 'users' ? (
        <AdminUsersTab
          users={usersState.users}
          isLoading={usersState.isLoading}
          error={usersState.error}
        />
      ) : (
        <AdminSalonsTab
          salons={salonsState.salons}
          isLoading={salonsState.isLoading}
          error={salonsState.error}
          approveSalon={salonsState.approveSalon}
        />
      )}
    </AppScreenLayout>
  );
}
