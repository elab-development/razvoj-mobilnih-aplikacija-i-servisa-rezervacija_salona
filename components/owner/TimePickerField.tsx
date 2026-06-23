import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { themeFonts } from '@/constants/theme';

type TimePickerFieldProps = {
  label: string;
  value: string;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
};

const webTimeOptions = createTimeOptions();

export function TimePickerField({
  label,
  value,
  disabled = false,
  error,
  onChange,
}: TimePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[
          styles.valueBox,
          disabled && styles.disabled,
          error ? styles.valueBoxError : null,
        ]}
        onPress={() => !disabled && setShowPicker((current) => !current)}
        disabled={disabled}
      >
        <Text style={[styles.valueText, !value && styles.placeholder]}>
          {value || '--:--'}
        </Text>
      </Pressable>

      {showPicker && !disabled && Platform.OS !== 'web' ? (
        <DateTimePicker
          value={timeStringToDate(value || '09:00')}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour
          onChange={(_, selectedDate) => {
            if (Platform.OS === 'android') {
              setShowPicker(false);
            }

            if (selectedDate) {
              onChange(dateToTimeString(selectedDate));
            }
          }}
        />
      ) : null}

      {showPicker && !disabled && Platform.OS === 'web' ? (
        <ScrollView style={styles.webOptions} nestedScrollEnabled>
          <View style={styles.webGrid}>
            {webTimeOptions.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.webOption,
                  option === value && styles.webOptionActive,
                ]}
                onPress={() => {
                  onChange(option);
                  setShowPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.webOptionText,
                    option === value && styles.webOptionTextActive,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function timeStringToDate(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(Number.isFinite(hours) ? hours : 9);
  date.setMinutes(Number.isFinite(minutes) ? minutes : 0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

function dateToTimeString(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

function createTimeOptions() {
  const options: string[] = [];

  for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
    const hours = Math.floor(minutes / 60);
    const minute = minutes % 60;
    options.push(`${String(hours).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
  }

  return options;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  label: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 12,
    fontWeight: '700',
    color: '#831843',
  },
  valueBox: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  valueBoxError: {
    borderColor: '#E11D48',
  },
  disabled: {
    opacity: 0.45,
  },
  valueText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 15,
    fontWeight: '700',
    color: '#3B0A24',
  },
  placeholder: {
    color: '#B9819F',
  },
  webOptions: {
    maxHeight: 168,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  webGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 8,
  },
  webOption: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFF1F7',
  },
  webOptionActive: {
    backgroundColor: '#DB2777',
  },
  webOptionText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 12,
    color: '#BE185D',
  },
  webOptionTextActive: {
    color: '#FFFFFF',
  },
  error: {
    fontFamily: themeFonts.body,
    fontSize: 12,
    color: '#E11D48',
  },
});
