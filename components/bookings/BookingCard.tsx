import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  formatBookingDate,
  isPastBooking,
  type UserBooking,
} from '@/components/bookings/bookingSort';
import { themeFonts } from '@/constants/theme';

type BookingCardProps = {
  booking: UserBooking;
  cancelling: boolean;
  onCancel: () => void;
};

export function BookingCard({ booking, cancelling, onCancel }: BookingCardProps) {
  const isPast = isPastBooking(booking);
  const isCancelled = booking.status === 'cancelled';
  const canCancel = !isPast && !isCancelled;

  return (
    <View
      style={[
        styles.card,
        isPast && styles.pastCard,
        isCancelled && styles.cancelledCard,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.salon}>{booking.salonName}</Text>
          <Text style={styles.service}>{booking.serviceName}</Text>
        </View>
        <Text
          style={[
            styles.status,
            isCancelled
              ? styles.statusCancelled
              : isPast
                ? styles.statusPast
                : styles.statusUpcoming,
          ]}
        >
          {isCancelled ? 'Cancelled' : isPast ? 'Past' : 'Upcoming'}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={18} color="#DB2777" />
        <Text style={styles.detailText}>{formatBookingDate(booking)}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={18} color="#DB2777" />
        <Text style={styles.detailText}>
          {booking.startsAt} - {booking.endsAt}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>{booking.priceRsd} RSD</Text>
        {canCancel ? (
          <Pressable
            style={[styles.cancelButton, cancelling && styles.disabledButton]}
            onPress={onCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#DB2777" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={18} color="#DB2777" />
                <Text style={styles.cancelText}>Cancel</Text>
              </>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  pastCard: {
    opacity: 0.76,
  },
  cancelledCard: {
    opacity: 0.64,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleGroup: {
    flex: 1,
    gap: 4,
  },
  salon: {
    fontFamily: themeFonts.display,
    fontSize: 23,
    fontWeight: '700',
    color: '#3B0A24',
  },
  service: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 14,
    fontWeight: '700',
    color: '#BE185D',
  },
  status: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontFamily: themeFonts.bodyStrong,
    fontSize: 12,
    fontWeight: '700',
  },
  statusUpcoming: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  statusPast: {
    backgroundColor: '#E2E8F0',
    color: '#475569',
  },
  statusCancelled: {
    backgroundColor: '#FFE4E6',
    color: '#BE123C',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontFamily: themeFonts.body,
    fontSize: 14,
    color: '#5F2940',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  price: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 15,
    fontWeight: '700',
    color: '#3B0A24',
  },
  cancelButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#F9A8D4',
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: '#FFF1F7',
  },
  cancelText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#DB2777',
  },
  disabledButton: {
    opacity: 0.65,
  },
});
