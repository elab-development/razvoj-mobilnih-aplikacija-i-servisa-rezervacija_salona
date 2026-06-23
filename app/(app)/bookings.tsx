import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/roleRoutes';

export default function BookingsScreen() {
  const { profile } = useAuth();

  if (profile?.role !== 'user') {
    return <Redirect href={getDefaultAppRoute(profile?.role)} />;
  }

  return (
    <AppScreenLayout
      title="Bookings"
      subtitle="Your upcoming and completed appointments will show here."
    >
      <View style={styles.emptyState}>
        <View style={styles.iconCircle}>
          <Ionicons name="calendar-outline" size={28} color="#DB2777" />
        </View>
        <Text style={styles.emptyTitle}>No bookings yet</Text>
        <Text style={styles.emptyText}>
          Once salon and service collections are connected, clients can reserve
          available time slots from this flow.
        </Text>
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
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
});
