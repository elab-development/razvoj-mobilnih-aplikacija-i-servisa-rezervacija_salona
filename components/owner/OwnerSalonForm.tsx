import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { OwnerFormField } from '@/components/owner/OwnerFormField';
import { SalonImagePicker } from '@/components/owner/SalonImagePicker';
import { SalonLocationPicker } from '@/components/owner/SalonLocationPicker';
import {
  SalonWorkingHoursEditor,
  toEditableWorkingHours,
  toSalonWorkingHours,
  weekDays,
  type EditableWorkingHours,
} from '@/components/owner/SalonWorkingHoursEditor';
import { PrimaryButton } from '@/components/PrimaryButton';
import { themeFonts } from '@/constants/theme';
import type { Salon, SalonCategory, WeekDay } from '@/types/salon';
import type {
  OwnerSalon,
  OwnerSalonUpdate,
} from '@/components/owner/useOwnerSalons';

const categories: SalonCategory[] = ['beauty', 'hair', 'nails', 'spa'];

type FormErrors = Partial<
  Record<
    | 'name'
    | 'description'
    | 'imageUrl'
    | 'street'
    | 'city'
    | 'coordinates'
    | `${WeekDay}.opensAt`
    | `${WeekDay}.closesAt`,
    string
  >
>;

type OwnerSalonFormProps = {
  salon: OwnerSalon;
  isSaving: boolean;
  databaseError?: string | null;
  onCancel: () => void;
  onSave: (salonId: string, data: OwnerSalonUpdate) => Promise<void>;
};

export function OwnerSalonForm({
  salon,
  isSaving,
  databaseError,
  onCancel,
  onSave,
}: OwnerSalonFormProps) {
  const [name, setName] = useState(salon.name);
  const [description, setDescription] = useState(salon.description);
  const [category, setCategory] = useState<SalonCategory>(salon.category);
  const [imageUrl, setImageUrl] = useState(salon.imageUrl);
  const [location, setLocation] = useState<Salon['location']>(salon.location);
  const [active, setActive] = useState(salon.active);
  const [workingHours, setWorkingHours] = useState<EditableWorkingHours>(
    toEditableWorkingHours(salon.workingHours),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setName(salon.name);
    setDescription(salon.description);
    setCategory(salon.category);
    setImageUrl(salon.imageUrl);
    setLocation(salon.location);
    setActive(salon.active);
    setWorkingHours(toEditableWorkingHours(salon.workingHours));
    setErrors({});
    setSubmitError(null);
  }, [salon]);

  const formTitle = useMemo(() => `Edit ${salon.name}`, [salon.name]);

  const handleSave = async () => {
    const nextErrors = validateSalonForm({
      name,
      description,
      imageUrl,
      location,
      workingHours,
    });

    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitError('Please fix the highlighted fields before saving.');
      return;
    }

    await onSave(salon.id, {
      name: name.trim(),
      description: description.trim(),
      category,
      imageUrl: imageUrl.trim(),
      location: {
        street: location.street.trim(),
        city: location.city.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
      },
      workingHours: toSalonWorkingHours(workingHours),
      active,
    });
  };

  return (
    <View style={styles.form}>
      <View style={styles.formHeader}>
        <View style={styles.titleGroup}>
          <Text style={styles.formTitle}>{formTitle}</Text>
          <Text style={styles.approvalText}>
            Approval: {salon.approved ? 'approved' : 'waiting for admin'}
          </Text>
        </View>
        <Pressable onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>Active salon</Text>
          <Text style={styles.statusText}>
            Active salons can be shown to clients after admin approval.
          </Text>
        </View>
        <Switch
          value={active}
          onValueChange={setActive}
          trackColor={{ false: '#F3D7E4', true: '#F9A8D4' }}
          thumbColor={active ? '#DB2777' : '#FFFFFF'}
        />
      </View>

      <OwnerFormField
        label="Salon name"
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

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryRow}>
          {categories.map((item) => {
            const selected = item === category;

            return (
              <Pressable
                key={item}
                style={[styles.categoryButton, selected && styles.categoryActive]}
                onPress={() => setCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selected && styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <SalonImagePicker
        salonId={salon.id}
        imageUrl={imageUrl}
        error={errors.imageUrl}
        onImageUrlChange={setImageUrl}
      />

      <SalonLocationPicker
        value={location}
        errors={{
          street: errors.street,
          city: errors.city,
          coordinates: errors.coordinates,
        }}
        onChange={setLocation}
      />

      <SalonWorkingHoursEditor
        value={workingHours}
        errors={errors}
        onChange={setWorkingHours}
      />

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
      {databaseError ? (
        <Text style={styles.submitError}>{databaseError}</Text>
      ) : null}

      <PrimaryButton title="Save changes" loading={isSaving} onPress={handleSave} />
    </View>
  );
}

function validateSalonForm({
  name,
  description,
  imageUrl,
  location,
  workingHours,
}: {
  name: string;
  description: string;
  imageUrl: string;
  location: Salon['location'];
  workingHours: EditableWorkingHours;
}) {
  const nextErrors: FormErrors = {};

  if (name.trim().length < 2) {
    nextErrors.name = 'Salon name must have at least 2 characters.';
  }

  if (description.trim().length < 12) {
    nextErrors.description = 'Description must have at least 12 characters.';
  }

  if (!imageUrl.trim()) {
    nextErrors.imageUrl = 'Choose a salon image from gallery.';
  }

  if (!location.street.trim()) {
    nextErrors.street = 'Street is required.';
  }

  if (!location.city.trim()) {
    nextErrors.city = 'City is required.';
  }

  if (!isValidCoordinate(location.latitude, -90, 90)) {
    nextErrors.coordinates = 'Latitude is not valid.';
  }

  if (!isValidCoordinate(location.longitude, -180, 180)) {
    nextErrors.coordinates = 'Longitude is not valid.';
  }

  for (const day of weekDays) {
    const dayValue = workingHours[day.key];

    if (!dayValue.isOpen) {
      continue;
    }

    if (!dayValue.opensAt) {
      nextErrors[`${day.key}.opensAt`] = 'Required.';
    }

    if (!dayValue.closesAt) {
      nextErrors[`${day.key}.closesAt`] = 'Required.';
    }

    if (
      dayValue.opensAt &&
      dayValue.closesAt &&
      toMinutes(dayValue.opensAt) >= toMinutes(dayValue.closesAt)
    ) {
      nextErrors[`${day.key}.closesAt`] = 'Must be after opening time.';
    }
  }

  return nextErrors;
}

function isValidCoordinate(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleGroup: {
    flex: 1,
    gap: 4,
  },
  formTitle: {
    fontFamily: themeFonts.display,
    fontSize: 23,
    fontWeight: '700',
    color: '#3B0A24',
  },
  approvalText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#BE185D',
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
    minHeight: 96,
    textAlignVertical: 'top',
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#831843',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#FFF1F7',
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  categoryActive: {
    backgroundColor: '#DB2777',
    borderColor: '#DB2777',
  },
  categoryText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#BE185D',
    textTransform: 'capitalize',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  submitError: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#E11D48',
  },
});
