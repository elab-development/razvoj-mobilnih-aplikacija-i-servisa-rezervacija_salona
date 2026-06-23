import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

import { formatDateLabel, getUpcomingDates, getWeekDayKey } from '@/components/salon/bookingTime';
import { themeFonts } from '@/constants/theme';
import type { BookableSalon } from '@/components/salon/useSalonBookingDetails';

type SalonDetailHeroProps = {
  salon: BookableSalon;
};

export function SalonDetailHero({ salon }: SalonDetailHeroProps) {
  const today = getUpcomingDates(1)[0];
  const todayHours = salon.workingHours[getWeekDayKey(today)];
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
        </View>

        <Text style={styles.description}>{salon.description}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color="#DB2777" />
          <Text style={styles.infoText}>{address}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color="#DB2777" />
          <Text style={styles.infoText}>
            {formatDateLabel(today)}:{' '}
            {todayHours?.isOpen
              ? `${todayHours.opensAt} - ${todayHours.closesAt}`
              : 'closed'}
          </Text>
        </View>

        <View style={styles.hoursBox}>
          <Text style={styles.hoursTitle}>Working hours</Text>
          {Object.entries(salon.workingHours).map(([day, hours]) => (
            <View key={day} style={styles.hoursRow}>
              <Text style={styles.day}>{day.slice(0, 3)}</Text>
              <Text style={styles.hoursText}>
                {hours.isOpen ? `${hours.opensAt} - ${hours.closesAt}` : 'Closed'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: 210,
    backgroundColor: '#FCE7F3',
  },
  content: {
    padding: 18,
    gap: 13,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flex: 1,
    gap: 7,
  },
  name: {
    fontFamily: themeFonts.display,
    fontSize: 30,
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
  description: {
    fontFamily: themeFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: '#8A4562',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontFamily: themeFonts.body,
    fontSize: 14,
    color: '#5F2940',
  },
  hoursBox: {
    gap: 8,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#FFF7FB',
  },
  hoursTitle: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 14,
    fontWeight: '700',
    color: '#831843',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  day: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#3B0A24',
    textTransform: 'capitalize',
  },
  hoursText: {
    fontFamily: themeFonts.body,
    fontSize: 13,
    color: '#8A4562',
  },
});
