import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { themeFonts } from '@/constants/theme';
import type { AvailableSalon } from '@/components/home/useAvailableSalons';

type SalonDiscoveryCardProps = {
  salon: AvailableSalon;
  onBook: () => void;
};

export function SalonDiscoveryCard({ salon, onBook }: SalonDiscoveryCardProps) {
  const address = `${salon.location.street}, ${salon.location.city}`;

  return (
    <View style={styles.card}>
      <Image source={{ uri: salon.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Text style={styles.name}>{salon.name}</Text>
            <Text style={styles.category}>{salon.category}</Text>
          </View>
          {salon.distanceKm !== undefined ? (
            <Text style={styles.distance}>{salon.distanceKm.toFixed(1)} km</Text>
          ) : null}
        </View>

        <Text style={styles.description}>{salon.description}</Text>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={17} color="#DB2777" />
          <Text style={styles.detailText}>{address}</Text>
        </View>

        <Pressable style={styles.bookButton} onPress={onBook}>
          <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
          <Text style={styles.bookText}>Book</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: 156,
    backgroundColor: '#FCE7F3',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleGroup: {
    flex: 1,
    gap: 5,
  },
  name: {
    fontFamily: themeFonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#3B0A24',
  },
  category: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FCE7F3',
    color: '#BE185D',
    fontFamily: themeFonts.bodyStrong,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  distance: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#3B0A24',
    color: '#FFFFFF',
    fontFamily: themeFonts.bodyStrong,
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontFamily: themeFonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: '#8A4562',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  detailText: {
    flex: 1,
    fontFamily: themeFonts.body,
    fontSize: 14,
    color: '#5F2940',
  },
  bookButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
    backgroundColor: '#DB2777',
  },
  bookText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
