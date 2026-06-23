import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { themeFonts } from '@/constants/theme';

type AdminStatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

export function AdminStatCard({ icon, label, value }: AdminStatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    gap: 7,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  iconBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#DB2777',
  },
  value: {
    fontFamily: themeFonts.display,
    fontSize: 26,
    fontWeight: '700',
    color: '#3B0A24',
  },
  label: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#8A4562',
  },
});
