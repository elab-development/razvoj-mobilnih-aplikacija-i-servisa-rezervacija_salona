import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { BookingCard } from '@/components/bookings/BookingCard';
import { useUserBookings } from '@/components/bookings/useUserBookings';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/roleRoutes';

export default function BookingsScreen() {
  const { profile, user } = useAuth();
  const { bookings, isLoading, error, cancelBooking } = useUserBookings(user?.uid);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (profile?.role !== 'user') {
    return <Redirect href={getDefaultAppRoute(profile?.role)} />;
  }

  const handleCancel = async (bookingId: string) => {
    setCancellingBookingId(bookingId);
    setCancelError(null);

    try {
      await cancelBooking(bookingId);
    } catch {
      setCancelError('Booking could not be cancelled. Please try again.');
    } finally {
      setCancellingBookingId(null);
    }
  };

  return (
    <AppScreenLayout
      title="Bookings"
      subtitle="Your upcoming appointments are shown first. Past bookings stay below."
    >
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{bookings.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {bookings.filter((booking) => booking.status === 'confirmed').length}
          </Text>
          <Text style={styles.summaryLabel}>Confirmed</Text>
        </View>
      </View>

      {cancelError ? <Text style={styles.errorText}>{cancelError}</Text> : null}

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#DB2777" />
          <Text style={styles.stateText}>Loading bookings...</Text>
        </View>
      ) : null}

      {!isLoading && error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Could not load bookings</Text>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : null}

      {!isLoading && !error && bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar-outline" size={28} color="#DB2777" />
          </View>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyText}>
            Once you reserve a salon appointment, it will appear here.
          </Text>
        </View>
      ) : null}

      {!isLoading && !error
        ? bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              cancelling={cancellingBookingId === booking.id}
              onCancel={() => handleCancel(booking.id)}
            />
          ))
        : null}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#FCE7F3',
  },
  summaryValue: {
    fontFamily: themeFonts.display,
    fontSize: 30,
    fontWeight: '700',
    color: '#BE185D',
  },
  summaryLabel: {
    fontFamily: themeFonts.bodyStrong,
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#831843',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCE7F3',
  },
  emptyTitle: {
    fontFamily: themeFonts.display,
    fontSize: 20,
    fontWeight: '700',
    color: '#3B0A24',
  },
  emptyText: {
    fontFamily: themeFonts.body,
    fontSize: 15,
    color: '#8A4562',
    lineHeight: 21,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#E11D48',
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
