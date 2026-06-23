import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { SalonBookingPanel } from '@/components/salon/SalonBookingPanel';
import { SalonDetailHero } from '@/components/salon/SalonDetailHero';
import { useSalonBookingDetails } from '@/components/salon/useSalonBookingDetails';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/roleRoutes';

export default function SalonDetailScreen() {
  const { profile } = useAuth();
  const params = useLocalSearchParams<{ salonId?: string | string[] }>();
  const salonId = Array.isArray(params.salonId)
    ? params.salonId[0]
    : params.salonId;
  const {
    salon,
    services,
    bookings,
    isLoading,
    bookingsLoading,
    error,
    createBooking,
  } = useSalonBookingDetails(salonId);

  if (profile?.role !== 'user') {
    return <Redirect href={getDefaultAppRoute(profile?.role)} />;
  }

  return (
    <AppScreenLayout
      title="Salon"
      subtitle="Choose a service and reserve an available time."
    >
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={18} color="#DB2777" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#DB2777" />
          <Text style={styles.stateText}>Loading salon...</Text>
        </View>
      ) : null}

      {!isLoading && error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Salon unavailable</Text>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : null}

      {!isLoading && !error && salon ? (
        <>
          <SalonDetailHero salon={salon} />
          <SalonBookingPanel
            salon={salon}
            services={services}
            bookings={bookings}
            bookingsLoading={bookingsLoading}
            onCreateBooking={createBooking}
          />
        </>
      ) : null}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: '#FCE7F3',
  },
  backText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 14,
    fontWeight: '700',
    color: '#DB2777',
  },
  stateBox: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
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
