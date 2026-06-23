import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import {
  formatOwnerBookingDate,
  type OwnerBooking,
  type OwnerBookingGroup,
} from '@/components/reminders/useOwnerBookings';
import { themeFonts } from '@/constants/theme';

type OwnerBookingGroupCardProps = {
  group: OwnerBookingGroup;
};

export function OwnerBookingGroupCard({ group }: OwnerBookingGroupCardProps) {
  return (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.groupTitleWrap}>
          <Text style={styles.groupTitle}>{group.salonName}</Text>
          <Text style={styles.groupSubtitle}>
            {group.bookings.length === 1
              ? '1 upcoming booking'
              : `${group.bookings.length} upcoming bookings`}
          </Text>
        </View>
        <View style={styles.groupIcon}>
          <Ionicons name="business-outline" size={19} color="#DB2777" />
        </View>
      </View>

      <View style={styles.bookingList}>
        {group.bookings.map((booking) => (
          <OwnerBookingCard key={booking.id} booking={booking} />
        ))}
      </View>
    </View>
  );
}

function OwnerBookingCard({ booking }: { booking: OwnerBooking }) {
  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingTitleWrap}>
          <Text style={styles.serviceName}>{booking.serviceName}</Text>
          <Text style={styles.clientName}>{booking.userName}</Text>
        </View>
        <Text style={styles.price}>{booking.priceRsd} RSD</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={17} color="#DB2777" />
        <Text style={styles.detailText}>{formatOwnerBookingDate(booking)}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={17} color="#DB2777" />
        <Text style={styles.detailText}>
          {booking.startsAt} - {booking.endsAt}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="mail-outline" size={17} color="#DB2777" />
        <Text style={styles.detailText}>{booking.userEmail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  groupCard: {
    gap: 14,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 22,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  groupTitleWrap: {
    flex: 1,
    gap: 4,
  },
  groupTitle: {
    fontFamily: themeFonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#3B0A24',
  },
  groupSubtitle: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#BE185D',
  },
  groupIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FCE7F3',
  },
  bookingList: {
    gap: 10,
  },
  bookingCard: {
    gap: 9,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#FFF7FB',
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  bookingTitleWrap: {
    flex: 1,
    gap: 3,
  },
  serviceName: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 15,
    fontWeight: '700',
    color: '#3B0A24',
  },
  clientName: {
    fontFamily: themeFonts.body,
    fontSize: 13,
    color: '#8A4562',
  },
  price: {
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
});
