import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { themeFonts } from '@/constants/theme';
import type { OwnerSalon } from '@/components/owner/useOwnerSalons';

type OwnerSalonCardProps = {
  salon: OwnerSalon;
  onEdit: () => void;
  onManageServices: () => void;
};

export function OwnerSalonCard({
  salon,
  onEdit,
  onManageServices,
}: OwnerSalonCardProps) {
  const address = `${salon.location.street}, ${salon.location.city}`;

  return (
    <View style={styles.card}>
      <Image source={{ uri: salon.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <Text style={styles.name}>{salon.name}</Text>
            <View style={styles.tagRow}>
              <Text style={styles.category}>{salon.category}</Text>
              <Text
                style={[
                  styles.statusTag,
                  salon.active ? styles.activeTag : styles.inactiveTag,
                ]}
              >
                {salon.active ? 'Active' : 'Inactive'}
              </Text>
              <Text
                style={[
                  styles.statusTag,
                  salon.approved ? styles.approvedTag : styles.pendingTag,
                ]}
              >
                {salon.approved ? 'Approved' : 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.actionStack}>
            <Pressable style={styles.actionButton} onPress={onEdit}>
              <Ionicons name='create-outline' size={18} color='#DB2777' />
              <Text style={styles.actionText}>Edit</Text>
            </Pressable>
            <Pressable
              style={styles.primaryActionButton}
              onPress={onManageServices}
            >
              <Ionicons name='sparkles-outline' size={18} color='#FFFFFF' />
              <Text style={styles.primaryActionText}>Services</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.description}>{salon.description}</Text>

        <View style={styles.detailRow}>
          <Ionicons name='location-outline' size={17} color='#DB2777' />
          <Text style={styles.detailText}>{address}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name='navigate-outline' size={17} color='#DB2777' />
          <Text style={styles.detailText}>
            {salon.location.latitude.toFixed(4)},{' '}
            {salon.location.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 22,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#FCE7F3',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleGroup: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: themeFonts.display,
    fontSize: 23,
    fontWeight: '700',
    color: '#3B0A24',
  },
  category: {
    fontFamily: themeFonts.bodyStrong,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#FCE7F3',
    color: '#BE185D',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusTag: {
    fontFamily: themeFonts.bodyStrong,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700',
  },
  activeTag: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  inactiveTag: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
  },
  approvedTag: {
    backgroundColor: '#E0E7FF',
    color: '#3730A3',
  },
  pendingTag: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  actionStack: {
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF1F7',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#DB2777',
  },
  actionText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#DB2777',
  },
  primaryActionText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
});
