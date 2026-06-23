import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { themeFonts } from '@/constants/theme';
import type { AdminSalon } from '@/components/admin/useAdminSalons';

type AdminSalonsTabProps = {
  salons: AdminSalon[];
  isLoading: boolean;
  error: string | null;
  approveSalon: (salonId: string) => Promise<void>;
};

export function AdminSalonsTab({
  salons,
  isLoading,
  error,
  approveSalon,
}: AdminSalonsTabProps) {
  const [approvingSalonId, setApprovingSalonId] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);

  const handleApprove = async (salonId: string) => {
    setApprovingSalonId(salonId);
    setApproveError(null);

    try {
      await approveSalon(salonId);
    } catch {
      setApproveError('Salon could not be approved. Please try again.');
    } finally {
      setApprovingSalonId(null);
    }
  };

  if (isLoading) {
    return <AdminState message="Loading salons..." loading />;
  }

  if (error) {
    return <AdminState title="Could not load salons" message={error} />;
  }

  return (
    <View style={styles.list}>
      {approveError ? <Text style={styles.error}>{approveError}</Text> : null}
      {salons.map((salon) => (
        <SalonCard
          key={salon.id}
          salon={salon}
          approving={approvingSalonId === salon.id}
          onApprove={() => handleApprove(salon.id)}
        />
      ))}
    </View>
  );
}

function SalonCard({
  salon,
  approving,
  onApprove,
}: {
  salon: AdminSalon;
  approving: boolean;
  onApprove: () => void;
}) {
  const address = `${salon.location.street}, ${salon.location.city}`;

  return (
    <View style={[styles.card, !salon.approved && styles.pendingCard]}>
      <Image source={{ uri: salon.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Text style={styles.name}>{salon.name}</Text>
            <Text style={styles.owner}>{salon.ownerEmail}</Text>
          </View>
          <Text
            style={[
              styles.status,
              salon.approved ? styles.approved : styles.pending,
            ]}
          >
            {salon.approved ? 'Approved' : 'Pending'}
          </Text>
        </View>

        <Text style={styles.description}>{salon.description}</Text>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={17} color="#DB2777" />
          <Text style={styles.detailText}>{address}</Text>
        </View>

        <View style={styles.tagRow}>
          <Text style={styles.category}>{salon.category}</Text>
          <Text
            style={[
              styles.activeTag,
              salon.active ? styles.activeSalon : styles.inactive,
            ]}
          >
            {salon.active ? 'Active' : 'Inactive'}
          </Text>
        </View>

        {!salon.approved ? (
          <Pressable
            style={[styles.approveButton, approving && styles.disabledButton]}
            onPress={onApprove}
            disabled={approving}
          >
            {approving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={19} color="#FFFFFF" />
                <Text style={styles.approveText}>Approve salon</Text>
              </>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function AdminState({
  title,
  message,
  loading = false,
}: {
  title?: string;
  message: string;
  loading?: boolean;
}) {
  return (
    <View style={styles.stateBox}>
      {loading ? <ActivityIndicator color="#DB2777" /> : null}
      {title ? <Text style={styles.stateTitle}>{title}</Text> : null}
      <Text style={styles.stateText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 14,
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  pendingCard: {
    borderColor: '#F59E0B',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#FCE7F3',
  },
  content: {
    padding: 14,
    gap: 11,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleGroup: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: themeFonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#3B0A24',
  },
  owner: {
    fontFamily: themeFonts.body,
    fontSize: 12,
    color: '#8A4562',
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
  approved: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  pending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  description: {
    fontFamily: themeFonts.body,
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 13,
    color: '#5F2940',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  category: {
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
  activeTag: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontFamily: themeFonts.bodyStrong,
    fontSize: 12,
    fontWeight: '700',
  },
  inactive: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
  },
  activeSalon: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  approveButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
    backgroundColor: '#DB2777',
  },
  approveText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.65,
  },
  error: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#E11D48',
  },
  stateBox: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  stateTitle: {
    fontFamily: themeFonts.display,
    fontSize: 20,
    fontWeight: '700',
    color: '#3B0A24',
    textAlign: 'center',
  },
  stateText: {
    fontFamily: themeFonts.body,
    fontSize: 14,
    color: '#8A4562',
    textAlign: 'center',
  },
});
