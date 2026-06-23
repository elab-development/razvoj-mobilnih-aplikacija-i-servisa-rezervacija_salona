import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { PrimaryButton } from '@/components/PrimaryButton';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function OwnerScreen() {
  const { profile } = useAuth();
  const canManageSalon = profile?.role === 'owner' || profile?.role === 'admin';

  if (!canManageSalon) {
    return <Redirect href="/home" />;
  }

  return (
    <AppScreenLayout
      title="Salon"
      subtitle="Owner tools for salon setup, services and booking availability."
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Salon profile</Text>
        <Text style={styles.cardText}>
          This is the right place to connect salon details once you confirm the
          Firestore structure for salons, services, staff and time slots.
        </Text>
        <PrimaryButton title="Set up salon" />
      </View>

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
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  cardTitle: {
    fontFamily: themeFonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#3B0A24',
  },
  cardText: {
    fontFamily: themeFonts.body,
    fontSize: 15,
    color: '#8A4562',
    lineHeight: 21,
  },
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
});
