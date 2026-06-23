import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { OwnerFormField } from '@/components/owner/OwnerFormField';
import { TimePickerField } from '@/components/owner/TimePickerField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { themeFonts } from '@/constants/theme';
import type {
  OwnerService,
  SalonServicePayload,
} from '@/components/owner/services/useSalonServices';

type ServiceFormErrors = Partial<
  Record<
    | 'name'
    | 'description'
    | 'priceRsd'
    | 'durationMinutes'
    | 'slotIntervalMinutes'
    | 'availableTimeSlots',
    string
  >
>;

type ServiceFormProps = {
  service?: OwnerService;
  isSaving: boolean;
  databaseError?: string | null;
  onCancel: () => void;
  onSave: (data: SalonServicePayload) => Promise<void>;
};

export function ServiceForm({
  service,
  isSaving,
  databaseError,
  onCancel,
  onSave,
}: ServiceFormProps) {
  const [name, setName] = useState(service?.name ?? '');
  const [description, setDescription] = useState(service?.description ?? '');
  const [priceRsd, setPriceRsd] = useState(String(service?.priceRsd ?? ''));
  const [durationMinutes, setDurationMinutes] = useState(
    String(service?.durationMinutes ?? 60),
  );
  const [slotIntervalMinutes, setSlotIntervalMinutes] = useState(
    String(service?.slotIntervalMinutes ?? 30),
  );
  const [status, setStatus] = useState<'active' | 'inactive'>(
    service?.status ?? 'active',
  );
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(
    service?.availableTimeSlots ?? [],
  );
  const [selectedSlot, setSelectedSlot] = useState('09:00');
  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setName(service?.name ?? '');
    setDescription(service?.description ?? '');
    setPriceRsd(String(service?.priceRsd ?? ''));
    setDurationMinutes(String(service?.durationMinutes ?? 60));
    setSlotIntervalMinutes(String(service?.slotIntervalMinutes ?? 30));
    setStatus(service?.status ?? 'active');
    setAvailableTimeSlots(service?.availableTimeSlots ?? []);
    setErrors({});
    setSubmitError(null);
  }, [service]);

  const title = useMemo(
    () => (service ? `Edit ${service.name}` : 'Add service'),
    [service],
  );

  const handleAddSlot = () => {
    setErrors((current) => ({
      ...current,
      availableTimeSlots: undefined,
    }));

    if (availableTimeSlots.includes(selectedSlot)) {
      setErrors((current) => ({
        ...current,
        availableTimeSlots: 'This time slot is already added.',
      }));
      return;
    }

    setAvailableTimeSlots((current) => [...current, selectedSlot].sort());
  };

  const handleSave = async () => {
    const nextErrors = validateServiceForm({
      name,
      description,
      priceRsd,
      durationMinutes,
      slotIntervalMinutes,
      availableTimeSlots,
    });

    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitError('Please fix the highlighted fields before saving.');
      return;
    }

    await onSave({
      name: name.trim(),
      description: description.trim(),
      priceRsd: Number(priceRsd),
      durationMinutes: Number(durationMinutes),
      slotIntervalMinutes: Number(slotIntervalMinutes),
      availableTimeSlots,
      status,
    });
  };

  return (
    <View style={styles.form}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>Active service</Text>
          <Text style={styles.statusText}>
            Inactive services stay saved but are hidden from booking.
          </Text>
        </View>
        <Switch
          value={status === 'active'}
          onValueChange={(isActive) =>
            setStatus(isActive ? 'active' : 'inactive')
          }
          trackColor={{ false: '#F3D7E4', true: '#F9A8D4' }}
          thumbColor={status === 'active' ? '#DB2777' : '#FFFFFF'}
        />
      </View>

      <OwnerFormField
        label="Service name"
        value={name}
        onChangeText={setName}
        error={errors.name}
      />
      <OwnerFormField
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.textArea}
        error={errors.description}
      />

      <View style={styles.grid}>
        <OwnerFormField
          label="Price (RSD)"
          value={priceRsd}
          onChangeText={setPriceRsd}
          keyboardType="number-pad"
          containerStyle={styles.gridField}
          error={errors.priceRsd}
        />
        <OwnerFormField
          label="Duration (min)"
          value={durationMinutes}
          onChangeText={setDurationMinutes}
          keyboardType="number-pad"
          containerStyle={styles.gridField}
          error={errors.durationMinutes}
        />
      </View>

      <OwnerFormField
        label="Slot interval (min)"
        value={slotIntervalMinutes}
        onChangeText={setSlotIntervalMinutes}
        keyboardType="number-pad"
        error={errors.slotIntervalMinutes}
      />

      <View style={styles.slotSection}>
        <Text style={styles.label}>Available time slots</Text>
        <View style={styles.slotPickerRow}>
          <TimePickerField
            label="Time"
            value={selectedSlot}
            onChange={setSelectedSlot}
          />
          <Pressable style={styles.addSlotButton} onPress={handleAddSlot}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.slotList}>
          {availableTimeSlots.map((slot) => (
            <Pressable
              key={slot}
              style={styles.slotChip}
              onPress={() =>
                setAvailableTimeSlots((current) =>
                  current.filter((item) => item !== slot),
                )
              }
            >
              <Text style={styles.slotChipText}>{slot}</Text>
              <Ionicons name="close" size={14} color="#BE185D" />
            </Pressable>
          ))}
        </View>

        {errors.availableTimeSlots ? (
          <Text style={styles.error}>{errors.availableTimeSlots}</Text>
        ) : null}
      </View>

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
      {databaseError ? (
        <Text style={styles.submitError}>{databaseError}</Text>
      ) : null}

      <PrimaryButton
        title={service ? 'Save service' : 'Create service'}
        loading={isSaving}
        onPress={handleSave}
      />
    </View>
  );
}

function validateServiceForm({
  name,
  description,
  priceRsd,
  durationMinutes,
  slotIntervalMinutes,
  availableTimeSlots,
}: {
  name: string;
  description: string;
  priceRsd: string;
  durationMinutes: string;
  slotIntervalMinutes: string;
  availableTimeSlots: string[];
}) {
  const nextErrors: ServiceFormErrors = {};
  const price = Number(priceRsd);
  const duration = Number(durationMinutes);
  const interval = Number(slotIntervalMinutes);

  if (name.trim().length < 2) {
    nextErrors.name = 'Service name must have at least 2 characters.';
  }

  if (description.trim().length < 8) {
    nextErrors.description = 'Description must have at least 8 characters.';
  }

  if (!Number.isFinite(price) || price <= 0) {
    nextErrors.priceRsd = 'Enter a valid price.';
  }

  if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
    nextErrors.durationMinutes = 'Duration must be 5-480 minutes.';
  }

  if (!Number.isInteger(interval) || interval < 5 || interval > 240) {
    nextErrors.slotIntervalMinutes = 'Interval must be 5-240 minutes.';
  }

  if (availableTimeSlots.length === 0) {
    nextErrors.availableTimeSlots = 'Add at least one time slot.';
  }

  return nextErrors;
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: themeFonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#3B0A24',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF1F7',
  },
  cancelText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#DB2777',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFF7FB',
  },
  statusCopy: {
    flex: 1,
    gap: 3,
  },
  statusTitle: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 15,
    fontWeight: '700',
    color: '#3B0A24',
  },
  statusText: {
    fontFamily: themeFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: '#8A4562',
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridField: {
    flex: 1,
  },
  slotSection: {
    gap: 8,
  },
  label: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#831843',
  },
  slotPickerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  addSlotButton: {
    width: 48,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#DB2777',
  },
  slotList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#FCE7F3',
  },
  slotChipText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#BE185D',
  },
  error: {
    fontFamily: themeFonts.body,
    fontSize: 12,
    color: '#E11D48',
  },
  submitError: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#E11D48',
  },
});
