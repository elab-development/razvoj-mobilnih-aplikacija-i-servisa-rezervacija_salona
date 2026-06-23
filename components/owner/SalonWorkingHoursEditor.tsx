import { StyleSheet, Switch, Text, View } from 'react-native';

import { TimePickerField } from '@/components/owner/TimePickerField';
import { themeFonts } from '@/constants/theme';
import type { SalonWorkingDay, WeekDay } from '@/types/salon';

export type EditableWorkingHours = Record<
  WeekDay,
  {
    isOpen: boolean;
    opensAt: string;
    closesAt: string;
  }
>;

export const weekDays: { key: WeekDay; label: string; name: string }[] = [
  { key: 'monday', label: 'Mon', name: 'Monday' },
  { key: 'tuesday', label: 'Tue', name: 'Tuesday' },
  { key: 'wednesday', label: 'Wed', name: 'Wednesday' },
  { key: 'thursday', label: 'Thu', name: 'Thursday' },
  { key: 'friday', label: 'Fri', name: 'Friday' },
  { key: 'saturday', label: 'Sat', name: 'Saturday' },
  { key: 'sunday', label: 'Sun', name: 'Sunday' },
];

type SalonWorkingHoursEditorProps = {
  value: EditableWorkingHours;
  errors?: Partial<
    Record<`${WeekDay}.opensAt` | `${WeekDay}.closesAt`, string>
  >;
  onChange: (value: EditableWorkingHours) => void;
};

export function SalonWorkingHoursEditor({
  value,
  errors,
  onChange,
}: SalonWorkingHoursEditorProps) {
  const updateWorkingDay = (
    day: WeekDay,
    patch: Partial<EditableWorkingHours[WeekDay]>,
  ) => {
    onChange({
      ...value,
      [day]: {
        ...value[day],
        ...patch,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Working hours</Text>
      <View style={styles.list}>
        {weekDays.map((day) => {
          const dayValue = value[day.key];

          return (
            <View key={day.key} style={styles.dayRow}>
              <View style={styles.dayHeader}>
                <View>
                  <Text style={styles.dayName}>{day.name}</Text>
                  <Text style={styles.dayState}>
                    {dayValue.isOpen ? 'Open' : 'Closed'}
                  </Text>
                </View>
                <Switch
                  value={dayValue.isOpen}
                  onValueChange={(isOpen) =>
                    updateWorkingDay(day.key, { isOpen })
                  }
                  trackColor={{ false: '#F3D7E4', true: '#F9A8D4' }}
                  thumbColor={dayValue.isOpen ? '#DB2777' : '#FFFFFF'}
                />
              </View>

              <View style={styles.timeRow}>
                <TimePickerField
                  label='Opens'
                  value={dayValue.opensAt}
                  disabled={!dayValue.isOpen}
                  error={errors?.[`${day.key}.opensAt`]}
                  onChange={(opensAt) => updateWorkingDay(day.key, { opensAt })}
                />
                <TimePickerField
                  label='Closes'
                  value={dayValue.closesAt}
                  disabled={!dayValue.isOpen}
                  error={errors?.[`${day.key}.closesAt`]}
                  onChange={(closesAt) =>
                    updateWorkingDay(day.key, { closesAt })
                  }
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function toEditableWorkingHours(
  workingHours: Record<WeekDay, SalonWorkingDay>,
): EditableWorkingHours {
  return Object.fromEntries(
    weekDays.map((day) => {
      const value = workingHours[day.key];

      return [
        day.key,
        {
          isOpen: value.isOpen,
          opensAt: value.opensAt ?? '09:00',
          closesAt: value.closesAt ?? '18:00',
        },
      ];
    }),
  ) as EditableWorkingHours;
}

export function toSalonWorkingHours(
  workingHours: EditableWorkingHours,
): Record<WeekDay, SalonWorkingDay> {
  return Object.fromEntries(
    weekDays.map((day) => {
      const value = workingHours[day.key];

      return [
        day.key,
        value.isOpen
          ? {
              isOpen: true,
              opensAt: value.opensAt,
              closesAt: value.closesAt,
            }
          : {
              isOpen: false,
              opensAt: null,
              closesAt: null,
            },
      ];
    }),
  ) as Record<WeekDay, SalonWorkingDay>;
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#831843',
  },
  list: {
    gap: 10,
  },
  dayRow: {
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#FFF7FB',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dayName: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 15,
    fontWeight: '700',
    color: '#3B0A24',
  },
  dayState: {
    fontFamily: themeFonts.body,
    marginTop: 2,
    fontSize: 12,
    color: '#8A4562',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
