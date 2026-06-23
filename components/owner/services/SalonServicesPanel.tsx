import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ServiceCard } from '@/components/owner/services/ServiceCard';
import { ServiceForm } from '@/components/owner/services/ServiceForm';
import {
  useSalonServices,
  type OwnerService,
  type SalonServicePayload,
} from '@/components/owner/services/useSalonServices';
import { themeFonts } from '@/constants/theme';
import type { OwnerSalon } from '@/components/owner/useOwnerSalons';

type SalonServicesPanelProps = {
  salon: OwnerSalon;
  onClose: () => void;
};

export function SalonServicesPanel({ salon, onClose }: SalonServicesPanelProps) {
  const {
    services,
    isLoading,
    error,
    createService,
    updateService,
  } = useSalonServices(salon.id);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleCreate = async (data: SalonServicePayload) => {
    setSavingKey('new');
    setSaveError(null);

    try {
      await createService(data);
      setIsCreating(false);
    } catch (error) {
      setSaveError(getServiceSaveErrorMessage(error));
    } finally {
      setSavingKey(null);
    }
  };

  const handleUpdate = async (service: OwnerService, data: SalonServicePayload) => {
    setSavingKey(service.id);
    setSaveError(null);

    try {
      await updateService(service.id, data);
      setEditingServiceId(null);
    } catch (error) {
      setSaveError(getServiceSaveErrorMessage(error));
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>Services</Text>
          <Text style={styles.subtitle}>{salon.name}</Text>
        </View>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={18} color="#DB2777" />
        </Pressable>
      </View>

      <Pressable
        style={styles.addButton}
        onPress={() => {
          setSaveError(null);
          setEditingServiceId(null);
          setIsCreating(true);
        }}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add service</Text>
      </Pressable>

      {isCreating ? (
        <ServiceForm
          isSaving={savingKey === 'new'}
          databaseError={saveError}
          onCancel={() => setIsCreating(false)}
          onSave={handleCreate}
        />
      ) : null}

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#DB2777" />
          <Text style={styles.stateText}>Loading services...</Text>
        </View>
      ) : null}

      {!isLoading && error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Could not load services</Text>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : null}

      {!isLoading && !error && services.length === 0 && !isCreating ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>No services yet</Text>
          <Text style={styles.stateText}>
            Add the first service clients will be able to book later.
          </Text>
        </View>
      ) : null}

      {!isLoading && !error
        ? services.map((service) =>
            editingServiceId === service.id ? (
              <ServiceForm
                key={service.id}
                service={service}
                isSaving={savingKey === service.id}
                databaseError={saveError}
                onCancel={() => setEditingServiceId(null)}
                onSave={(data) => handleUpdate(service, data)}
              />
            ) : (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={() => {
                  setSaveError(null);
                  setIsCreating(false);
                  setEditingServiceId(service.id);
                }}
              />
            ),
          )
        : null}
    </View>
  );
}

function getServiceSaveErrorMessage(error: unknown) {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : null;

  switch (code) {
    case 'permission-denied':
      return 'You do not have permission to change services for this salon.';
    case 'not-found':
      return 'This service no longer exists in the database.';
    case 'unavailable':
      return 'Database is temporarily unavailable. Please try again.';
    default:
      return 'Service could not be saved. Please check the fields and try again.';
  }
}

const styles = StyleSheet.create({
  panel: {
    gap: 14,
    borderWidth: 1,
    borderColor: '#F9A8D4',
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#FFF1F7',
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
  title: {
    fontFamily: themeFonts.display,
    fontSize: 25,
    fontWeight: '700',
    color: '#3B0A24',
  },
  subtitle: {
    fontFamily: themeFonts.body,
    fontSize: 14,
    color: '#8A4562',
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: '#DB2777',
  },
  addButtonText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stateBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 18,
    padding: 18,
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
    lineHeight: 20,
    color: '#8A4562',
    textAlign: 'center',
  },
});
