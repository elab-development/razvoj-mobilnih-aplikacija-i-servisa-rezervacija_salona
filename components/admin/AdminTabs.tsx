import { Pressable, StyleSheet, Text, View } from 'react-native';

import { themeFonts } from '@/constants/theme';

export type AdminTab = 'users' | 'salons';

type AdminTabsProps = {
  activeTab: AdminTab;
  userCount: number;
  pendingSalonCount: number;
  salonCount: number;
  onChange: (tab: AdminTab) => void;
};

export function AdminTabs({
  activeTab,
  userCount,
  pendingSalonCount,
  salonCount,
  onChange,
}: AdminTabsProps) {
  return (
    <View style={styles.tabs}>
      <AdminTabButton
        active={activeTab === 'users'}
        label="Users"
        count={userCount}
        onPress={() => onChange('users')}
      />
      <AdminTabButton
        active={activeTab === 'salons'}
        label="Salons"
        count={pendingSalonCount || salonCount}
        urgent={pendingSalonCount > 0}
        onPress={() => onChange('salons')}
      />
    </View>
  );
}

function AdminTabButton({
  active,
  label,
  count,
  urgent = false,
  onPress,
}: {
  active: boolean;
  label: string;
  count: number;
  urgent?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
      <Text
        style={[
          styles.count,
          active && styles.countActive,
          urgent && styles.countUrgent,
        ]}
      >
        {count}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 18,
    padding: 6,
    backgroundColor: '#FCE7F3',
  },
  tabButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 15,
    fontWeight: '700',
    color: '#BE185D',
  },
  tabTextActive: {
    color: '#3B0A24',
  },
  count: {
    overflow: 'hidden',
    minWidth: 24,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: '#FFFFFF',
    color: '#BE185D',
    fontFamily: themeFonts.bodyStrong,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  countActive: {
    backgroundColor: '#DB2777',
    color: '#FFFFFF',
  },
  countUrgent: {
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
  },
});
