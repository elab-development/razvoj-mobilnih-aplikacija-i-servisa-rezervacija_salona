import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { themeFonts } from '@/constants/theme';
import type { OwnerService } from '@/components/owner/services/useSalonServices';

type ServiceCardProps = {
  service: OwnerService;
  onEdit: () => void;
};

export function ServiceCard({ service, onEdit }: ServiceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.name}>{service.name}</Text>
          <Text
            style={[
              styles.status,
              service.status === 'active' ? styles.active : styles.inactive,
            ]}
          >
            {service.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>

        <Pressable style={styles.editButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={18} color="#DB2777" />
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <Text style={styles.description}>{service.description}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaValue}>{service.priceRsd}</Text>
          <Text style={styles.metaLabel}>RSD</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaValue}>{service.durationMinutes}</Text>
          <Text style={styles.metaLabel}>min</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaValue}>{service.availableTimeSlots.length}</Text>
          <Text style={styles.metaLabel}>slots</Text>
        </View>
      </View>

      <View style={styles.slotRow}>
        {service.availableTimeSlots.slice(0, 8).map((slot) => (
          <Text key={slot} style={styles.slot}>
            {slot}
          </Text>
        ))}
        {service.availableTimeSlots.length > 8 ? (
          <Text style={styles.moreSlots}>+{service.availableTimeSlots.length - 8}</Text>
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
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleGroup: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontFamily: themeFonts.display,
    fontSize: 21,
    fontWeight: '700',
    color: '#3B0A24',
  },
  status: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontFamily: themeFonts.bodyStrong,
    fontSize: 12,
    fontWeight: '700',
  },
  active: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  inactive: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF1F7',
  },
  editText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#DB2777',
  },
  description: {
    fontFamily: themeFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: '#8A4562',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaItem: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#FFF7FB',
  },
  metaValue: {
    fontFamily: themeFonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#3B0A24',
  },
  metaLabel: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 12,
    fontWeight: '700',
    color: '#BE185D',
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  slot: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#FCE7F3',
    fontFamily: themeFonts.bodyStrong,
    fontSize: 12,
    color: '#BE185D',
  },
  moreSlots: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#3B0A24',
    fontFamily: themeFonts.bodyStrong,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
