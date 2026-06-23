import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { collection, doc } from 'firebase/firestore';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { OwnerSalonCard } from '@/components/owner/OwnerSalonCard';
import { OwnerSalonForm } from '@/components/owner/OwnerSalonForm';
import { SalonServicesPanel } from '@/components/owner/services/SalonServicesPanel';
import {
  useOwnerSalons,
  type OwnerSalon,
  type OwnerSalonUpdate,
} from '@/components/owner/useOwnerSalons';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { getDefaultAppRoute } from '@/lib/roleRoutes';
import type { WeekDay } from '@/types/salon';

export default function OwnerScreen() {
  const { profile, user } = useAuth();
  const { salons, isLoading, error, createSalon, updateSalon } = useOwnerSalons(
    user?.uid,
    profile?.email,
  );
  const [creatingSalon, setCreatingSalon] = useState<OwnerSalon | null>(null);
  const [editingSalonId, setEditingSalonId] = useState<string | null>(null);
  const [servicesSalonId, setServicesSalonId] = useState<string | null>(null);
  const [savingSalonId, setSavingSalonId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (profile?.role !== 'owner') {
    return <Redirect href={getDefaultAppRoute(profile?.role)} />;
  }

  const editingSalon = salons.find((salon) => salon.id === editingSalonId);
  const servicesSalon = salons.find((salon) => salon.id === servicesSalonId);

  const handleStartCreate = () => {
    if (!user || !profile?.email) {
      setSaveError('Owner profile is still loading. Please try again.');
      return;
    }

    setSaveError(null);
    setEditingSalonId(null);
    setServicesSalonId(null);
    setCreatingSalon(
      createDraftSalon(doc(collection(db, 'salons')).id, user.uid, profile.email),
    );
  };

  const handleCreate = async (salonId: string, data: OwnerSalonUpdate) => {
    setSavingSalonId(salonId);
    setSaveError(null);

    try {
      await createSalon(salonId, data);
      setCreatingSalon(null);
    } catch (saveError) {
      setSaveError(getSaveErrorMessage(saveError));
    } finally {
      setSavingSalonId(null);
    }
  };

  const handleUpdate = async (salonId: string, data: OwnerSalonUpdate) => {
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
        <View style={styles.sectionActions}>
          <Text style={styles.sectionCount}>{salons.length}</Text>
          <Pressable style={styles.addSalonButton} onPress={handleStartCreate}>
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addSalonText}>Add salon</Text>
          </Pressable>
        </View>
      </View>

      {creatingSalon ? (
        <OwnerSalonForm
          salon={creatingSalon}
          mode="create"
          isSaving={savingSalonId === creatingSalon.id}
          databaseError={saveError}
          onCancel={() => setCreatingSalon(null)}
          onSave={handleCreate}
        />
      ) : null}

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

      {!isLoading && !error && salons.length === 0 && !creatingSalon ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>No salons yet</Text>
          <Text style={styles.stateText}>
            Add your first salon so you can set services and later accept
            bookings.
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
                setCreatingSalon(null);
                setServicesSalonId(null);
                setEditingSalonId(salon.id);
              }}
              onManageServices={() => {
                setSaveError(null);
                setCreatingSalon(null);
                setEditingSalonId(null);
                setServicesSalonId(salon.id);
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
          onSave={handleUpdate}
        />
      ) : null}

      {servicesSalon ? (
        <SalonServicesPanel
          salon={servicesSalon}
          onClose={() => setServicesSalonId(null)}
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
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: themeFonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#3B0A24',
  },
  addSalonButton: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#DB2777',
  },
  addSalonText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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

function createDraftSalon(
  id: string,
  ownerId: string,
  ownerEmail: string,
): OwnerSalon {
  return {
    id,
    name: '',
    description: '',
    category: 'beauty',
    imageUrl: '',
    ownerId,
    ownerEmail,
    location: {
      street: '',
      city: '',
      latitude: 44.8125,
      longitude: 20.4612,
    },
    workingHours: createDefaultWorkingHours(),
    active: true,
    approved: false,
  };
}

function createDefaultWorkingHours(): OwnerSalon['workingHours'] {
  const openWeekDays: WeekDay[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
  ];
  const weekendDays: WeekDay[] = ['saturday', 'sunday'];

  return {
    ...Object.fromEntries(
      openWeekDays.map((day) => [
        day,
        { isOpen: true, opensAt: '09:00', closesAt: '18:00' },
      ]),
    ),
    ...Object.fromEntries(
      weekendDays.map((day) => [
        day,
        { isOpen: false, opensAt: null, closesAt: null },
      ]),
    ),
  } as OwnerSalon['workingHours'];
}
