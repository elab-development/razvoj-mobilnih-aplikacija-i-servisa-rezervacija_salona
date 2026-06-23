import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { OwnerBookingGroupCard } from '@/components/reminders/OwnerBookingGroupCard';
import { useOwnerBookings } from '@/components/reminders/useOwnerBookings';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/roleRoutes';

export default function RemindersScreen() {
  const { profile, user } = useAuth();
  const ownerId = profile?.role === 'owner' ? user?.uid : undefined;
  const { upcomingGroups, upcomingBookings, isLoading, error } = useOwnerBookings(ownerId);

  if (profile?.role !== 'owner') {
    return <Redirect href={getDefaultAppRoute(profile?.role)} />;
  }

  return (
    <AppScreenLayout
      title="Reminders"
      subtitle="Upcoming client bookings grouped by salon."
    >
      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons name="notifications" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.summaryTextGroup}>
          <Text style={styles.summaryValue}>{upcomingBookings.length}</Text>
          <Text style={styles.summaryLabel}>
            {upcomingBookings.length === 1
              ? 'upcoming booking'
              : 'upcoming bookings'}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#DB2777" />
          <Text style={styles.stateText}>Loading reminders...</Text>
        </View>
      ) : null}

      {!isLoading && error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Could not load reminders</Text>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : null}

      {!isLoading && !error && upcomingGroups.length === 0 ? (
        <View style={styles.stateBox}>
          <Ionicons name="calendar-outline" size={30} color="#DB2777" />
          <Text style={styles.stateTitle}>No upcoming bookings</Text>
          <Text style={styles.stateText}>
            Future client bookings will be grouped by salon here.
          </Text>
        </View>
      ) : null}

      {!isLoading && !error
        ? upcomingGroups.map((group) => (
            <OwnerBookingGroupCard key={group.salonId} group={group} />
          ))
        : null}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  summaryIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#DB2777',
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryValue: {
    fontFamily: themeFonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#3B0A24',
  },
  summaryLabel: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 14,
    fontWeight: '700',
    color: '#8A4562',
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
