import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  addMinutes,
  formatDateLabel,
  getAvailableSlots,
  getUpcomingDates,
} from '@/components/salon/bookingTime';
import { PrimaryButton } from '@/components/PrimaryButton';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import type { BookingPayload, Booking } from '@/types/booking';
import type {
  BookableSalon,
  BookableService,
} from '@/components/salon/useSalonBookingDetails';

type SalonBookingPanelProps = {
  salon: BookableSalon;
  services: BookableService[];
  bookings: Booking[];
  bookingsLoading: boolean;
  onCreateBooking: (data: BookingPayload) => Promise<void>;
};

export function SalonBookingPanel({
  salon,
  services,
  bookings,
  bookingsLoading,
  onCreateBooking,
}: SalonBookingPanelProps) {
  const { profile, user } = useAuth();
  const dates = useMemo(() => getUpcomingDates(14), []);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    services[0]?.id ?? null,
  );
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedService = services.find(
    (service) => service.id === selectedServiceId,
  );

  const availableSlots = useMemo(() => {
    if (!selectedService) {
      return [];
    }

    return getAvailableSlots({
      bookings,
      date: selectedDate,
      salon,
      service: selectedService,
    });
  }, [bookings, salon, selectedDate, selectedService]);

  useEffect(() => {
    setSelectedServiceId((currentServiceId) => currentServiceId ?? services[0]?.id ?? null);
  }, [services]);

  useEffect(() => {
    setSelectedSlot(null);
    setBookingError(null);
    setSuccessMessage(null);
  }, [selectedDate, selectedServiceId]);

  const handleBook = async () => {
    setBookingError(null);
    setSuccessMessage(null);

    if (!user || !profile) {
      setBookingError('You need to be signed in before booking.');
      return;
    }

    if (!selectedService) {
      setBookingError('Choose a service first.');
      return;
    }

    if (!selectedSlot || !availableSlots.includes(selectedSlot)) {
      setBookingError('Choose an available time slot.');
      return;
    }

    const endsAt = addMinutes(selectedSlot, selectedService.durationMinutes);

    setIsBooking(true);

    try {
      await onCreateBooking({
        userId: user.uid,
        userName: profile.name,
        userEmail: profile.email,
        salonId: salon.id,
        salonName: salon.name,
        ownerId: salon.ownerId,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date: selectedDate,
        startsAt: selectedSlot,
        endsAt,
        priceRsd: selectedService.priceRsd,
        currency: 'RSD',
        status: 'confirmed',
      });
      setSelectedSlot(null);
      setSuccessMessage('Booking created. We will show it in Bookings next.');
    } catch {
      setBookingError('Booking could not be created. Please try another slot.');
    } finally {
      setIsBooking(false);
    }
  };

  if (services.length === 0) {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>Book appointment</Text>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No services yet</Text>
          <Text style={styles.emptyText}>
            This salon has no active services available for booking.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Book appointment</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Choose service</Text>
        <View style={styles.serviceList}>
          {services.map((service) => {
            const selected = service.id === selectedServiceId;

            return (
              <Pressable
                key={service.id}
                style={[styles.serviceCard, selected && styles.serviceCardActive]}
                onPress={() => setSelectedServiceId(service.id)}
              >
                <View style={styles.serviceHeader}>
                  <Text
                    style={[
                      styles.serviceName,
                      selected && styles.serviceNameActive,
                    ]}
                  >
                    {service.name}
                  </Text>
                  <Text
                    style={[
                      styles.servicePrice,
                      selected && styles.servicePriceActive,
                    ]}
                  >
                    {service.priceRsd} RSD
                  </Text>
                </View>
                <Text
                  style={[
                    styles.serviceMeta,
                    selected && styles.serviceMetaActive,
                  ]}
                >
                  {service.durationMinutes} min
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Choose date</Text>
        <View style={styles.dateList}>
          {dates.map((date) => {
            const selected = date === selectedDate;

            return (
              <Pressable
                key={date}
                style={[styles.dateChip, selected && styles.dateChipActive]}
                onPress={() => setSelectedDate(date)}
              >
                <Text
                  style={[styles.dateText, selected && styles.dateTextActive]}
                >
                  {formatDateLabel(date)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.slotHeader}>
          <Text style={styles.label}>Available times</Text>
          {bookingsLoading ? <ActivityIndicator color="#DB2777" /> : null}
        </View>

        <View style={styles.slotList}>
          {availableSlots.map((slot) => {
            const selected = slot === selectedSlot;

            return (
              <Pressable
                key={slot}
                style={[styles.slotChip, selected && styles.slotChipActive]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text
                  style={[styles.slotText, selected && styles.slotTextActive]}
                >
                  {slot}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!bookingsLoading && availableSlots.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No free slots</Text>
            <Text style={styles.emptyText}>
              Try another date or service for this salon.
            </Text>
          </View>
        ) : null}
      </View>

      {bookingError ? <Text style={styles.errorText}>{bookingError}</Text> : null}
      {successMessage ? (
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#166534" />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <PrimaryButton
        title="Confirm booking"
        loading={isBooking}
        disabled={!selectedSlot || !selectedService}
        onPress={handleBook}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 17,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: themeFonts.display,
    fontSize: 26,
    fontWeight: '700',
    color: '#3B0A24',
  },
  section: {
    gap: 10,
  },
  label: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 14,
    fontWeight: '700',
    color: '#831843',
  },
  serviceList: {
    gap: 10,
  },
  serviceCard: {
    gap: 7,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#FFF7FB',
  },
  serviceCardActive: {
    borderColor: '#DB2777',
    backgroundColor: '#DB2777',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  serviceName: {
    flex: 1,
    fontFamily: themeFonts.bodyStrong,
    fontSize: 16,
    fontWeight: '700',
    color: '#3B0A24',
  },
  serviceNameActive: {
    color: '#FFFFFF',
  },
  servicePrice: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 14,
    fontWeight: '700',
    color: '#BE185D',
  },
  servicePriceActive: {
    color: '#FFFFFF',
  },
  serviceMeta: {
    fontFamily: themeFonts.body,
    fontSize: 13,
    color: '#8A4562',
  },
  serviceMetaActive: {
    color: '#FCE7F3',
  },
  dateList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateChip: {
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: '#FFF7FB',
  },
  dateChipActive: {
    borderColor: '#DB2777',
    backgroundColor: '#DB2777',
  },
  dateText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#BE185D',
  },
  dateTextActive: {
    color: '#FFFFFF',
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: '#FFF7FB',
  },
  slotChipActive: {
    borderColor: '#3B0A24',
    backgroundColor: '#3B0A24',
  },
  slotText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 14,
    fontWeight: '700',
    color: '#BE185D',
  },
  slotTextActive: {
    color: '#FFFFFF',
  },
  emptyBox: {
    gap: 5,
    borderRadius: 18,
    padding: 15,
    backgroundColor: '#FFF7FB',
  },
  emptyTitle: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 15,
    fontWeight: '700',
    color: '#3B0A24',
  },
  emptyText: {
    fontFamily: themeFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: '#8A4562',
  },
  errorText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#E11D48',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#DCFCE7',
  },
  successText: {
    flex: 1,
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
});
