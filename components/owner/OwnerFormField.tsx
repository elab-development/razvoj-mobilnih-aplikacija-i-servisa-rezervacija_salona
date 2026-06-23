import {
  StyleSheet,
  Text,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
  View,
} from 'react-native';

import { themeFonts } from '@/constants/theme';

type OwnerFormFieldProps = TextInputProps & {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function OwnerFormField({
  label,
  error,
  containerStyle,
  style,
  ...props
}: OwnerFormFieldProps) {
  return (
    <View style={[styles.fieldGroup, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#B9819F"
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#831843',
  },
  input: {
    fontFamily: themeFonts.body,
    minHeight: 48,
    backgroundColor: '#FFF7FB',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#3B0A24',
  },
  inputError: {
    borderColor: '#E11D48',
  },
  error: {
    fontFamily: themeFonts.body,
    fontSize: 12,
    color: '#E11D48',
  },
});
