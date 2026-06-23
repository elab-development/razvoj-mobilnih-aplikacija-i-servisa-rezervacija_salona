import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { themeFonts } from '@/constants/theme';

type BookMeLogoProps = {
  compact?: boolean;
};

export function BookMeLogo({ compact = false }: BookMeLogoProps) {
  return (
    <View style={styles.logo}>
      <View style={[styles.mark, compact && styles.markCompact]}>
        <Ionicons
          name="calendar-clear-outline"
          size={compact ? 15 : 18}
          color="#FFFFFF"
        />
        <View style={styles.spark}>
          <Ionicons name="sparkles" size={compact ? 9 : 11} color="#DB2777" />
        </View>
      </View>
      <Text style={[styles.name, compact && styles.nameCompact]}>BookMe</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DB2777',
  },
  markCompact: {
    width: 34,
    height: 34,
    borderRadius: 12,
  },
  spark: {
    position: 'absolute',
    right: -4,
    top: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  name: {
    fontFamily: themeFonts.display,
    fontSize: 25,
    fontWeight: '700',
    color: '#3B0A24',
  },
  nameCompact: {
    fontSize: 22,
  },
});
