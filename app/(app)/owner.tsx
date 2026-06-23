import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { OwnerSalonCard } from '@/components/owner/OwnerSalonCard';
import { OwnerSalonForm } from '@/components/owner/OwnerSalonForm';
import {
  useOwnerSalons,
  type OwnerSalonUpdate,
} from '@/components/owner/useOwnerSalons';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/roleRoutes';

export default function OwnerScreen() {
  const { profile, user } = useAuth();
  const { salons, isLoading, error, updateSalon } = useOwnerSalons(user?.uid);
  const [editingSalonId, setEditingSalonId] = useState<string | null>(null);
  const [savingSalonId, setSavingSalonId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (profile?.role !== 'owner') {
    return <Redirect href={getDefaultAppRoute(profile?.role)} />;
  }

  const editingSalon = salons.find((salon) => salon.id === editingSalonId);

  const handleSave = async (salonId: string, data: OwnerSalonUpdate) => {
    setSavingSalonId(salonId);
    setSaveError(null);

    try {
      await updateSalon(salonId, data);
      setEditingSalonId(null);
    } catch (saveError) {
      setSaveError(getSaveErrorMessage(saveError));
    } finally {
      setSavingSalonId(null);
    }
  };

  return (
    <AppScreenLayout
      title="Salon"
      subtitle="Manage your salon profiles and booking setup."
    >
      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>0</Text>
          <Text style={styles.metricLabel}>Today</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>0</Text>
          <Text style={styles.metricLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your salons</Text>
        <Text style={styles.sectionCount}>{salons.length}</Text>
      </View>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#DB2777" />
          <Text style={styles.stateText}>Loading salons...</Text>
        </View>
      ) : null}

      {!isLoading && error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Could not load salons</Text>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : null}

      {!isLoading && !error && salons.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>No salons yet</Text>
          <Text style={styles.stateText}>
            Salon creation will come next. Seeded owner accounts should already
            have one salon assigned.
          </Text>
        </View>
      ) : null}

      {!isLoading && !error
        ? salons.map((salon) => (
            <OwnerSalonCard
              key={salon.id}
              salon={salon}
              onEdit={() => {
                setSaveError(null);
                setEditingSalonId(salon.id);
              }}
            />
          ))
        : null}

      {editingSalon ? (
        <OwnerSalonForm
          salon={editingSalon}
          isSaving={savingSalonId === editingSalon.id}
          databaseError={saveError}
          onCancel={() => setEditingSalonId(null)}
          onSave={handleSave}
        />
      ) : null}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FCE7F3',
    borderRadius: 18,
    padding: 18,
  },
  metricValue: {
    fontFamily: themeFonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#BE185D',
  },
  metricLabel: {
    fontFamily: themeFonts.bodyStrong,
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#831843',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: themeFonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#3B0A24',
  },
  sectionCount: {
    fontFamily: themeFonts.bodyStrong,
    minWidth: 32,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
    textAlign: 'center',
    backgroundColor: '#DB2777',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  stateBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  stateTitle: {
    fontFamily: themeFonts.display,
    fontSize: 20,
    fontWeight: '700',
    color: '#3B0A24',
    textAlign: 'center',
  },
  stateText: {
    fontFamily: themeFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: '#8A4562',
    textAlign: 'center',
  },
});

function getSaveErrorMessage(error: unknown) {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : null;

  switch (code) {
    case 'permission-denied':
      return 'You do not have permission to update this salon.';
    case 'not-found':
      return 'This salon no longer exists in the database.';
    case 'unavailable':
      return 'Database is temporarily unavailable. Please try again.';
    default:
      return 'Salon update failed. Please check your connection and try again.';
  }
}
