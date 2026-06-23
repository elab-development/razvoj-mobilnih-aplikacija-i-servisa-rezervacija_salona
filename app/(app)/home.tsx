import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { BookMeLogo } from '@/components/BookMeLogo';
import { PrimaryButton } from '@/components/PrimaryButton';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { profile } = useAuth();

  return (
    <AppScreenLayout
      title={`Hi, ${profile?.name ?? 'there'}`}
      subtitle="Find your next beauty appointment and keep upcoming bookings in one place."
    >
      <View style={styles.logoRow}>
        <BookMeLogo compact />
      </View>

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="sparkles" size={26} color="#FFFFFF" />
        </View>
        <Text style={styles.heroTitle}>Beauty time, beautifully organized.</Text>
        <Text style={styles.heroText}>
          Salon search, service selection and appointment booking are ready for
          the next Firestore layer.
        </Text>
        <PrimaryButton title="Explore salons" variant="secondary" />
      </View>

      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#DB2777',
    borderRadius: 24,
    padding: 22,
    gap: 14,
  },
  logoRow: {
    alignItems: 'flex-start',
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroTitle: {
    fontFamily: themeFonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroText: {
    fontFamily: themeFonts.body,
    fontSize: 15,
    color: '#FCE7F3',
    lineHeight: 21,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 18,
    padding: 18,
  },
  statValue: {
    fontFamily: themeFonts.display,
    fontSize: 30,
    fontWeight: '700',
    color: '#3B0A24',
  },
  statLabel: {
    fontFamily: themeFonts.bodyStrong,
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#8A4562',
  },
});
