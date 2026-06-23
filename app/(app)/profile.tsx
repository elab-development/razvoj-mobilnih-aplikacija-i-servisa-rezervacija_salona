import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookMeLogo } from '@/components/BookMeLogo';
import { useUserBookings } from '@/components/bookings/useUserBookings';
import { useFavoriteSalons } from '@/components/home/useFavoriteSalons';
import { useOwnerBookings } from '@/components/reminders/useOwnerBookings';
import { PrimaryButton } from '@/components/PrimaryButton';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

function getRoleLabel(role: string | undefined) {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'owner':
      return 'Salon owner';
    case 'user':
      return 'Client';
    default:
      return 'BookMe member';
  }
}

function getInitials(name: string | undefined) {
  if (!name?.trim()) {
    return 'BM';
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function ProfileScreen() {
  const { profile, user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const userStatsId = profile?.role === 'user' ? user?.uid : undefined;
  const ownerStatsId = profile?.role === 'owner' ? user?.uid : undefined;
  const {
    bookings: userBookings,
    isLoading: userBookingsLoading,
  } = useUserBookings(userStatsId);
  const {
    favoriteSalonIds,
    isLoading: favoriteSalonsLoading,
  } = useFavoriteSalons(userStatsId);
  const {
    upcomingBookings,
    completedBookings,
    isLoading: ownerBookingsLoading,
  } = useOwnerBookings(ownerStatsId);
  const profileStats =
    profile?.role === 'user'
      ? [
          {
            label: 'Bookings',
            value: userBookingsLoading ? '...' : String(userBookings.length),
          },
          {
            label: 'Saved salons',
            value: favoriteSalonsLoading ? '...' : String(favoriteSalonIds.length),
          },
        ]
      : profile?.role === 'owner'
        ? [
            {
              label: 'Upcoming bookings',
              value: ownerBookingsLoading ? '...' : String(upcomingBookings.length),
            },
            {
              label: 'Completed bookings',
              value: ownerBookingsLoading ? '...' : String(completedBookings.length),
            },
          ]
        : [];

  const handleLogout = async () => {
    setLoading(true);

    try {
      await logout();
    } catch {
      Alert.alert('Error', 'Sign out failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <BookMeLogo compact />
          {profile?.role === 'admin' ? null : (
            <View style={styles.iconButton}>
              <Ionicons name="settings-outline" size={20} color="#BE185D" />
            </View>
          )}
        </View>

        <View style={styles.profileHero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(profile?.name)}</Text>
          </View>

          <Text style={styles.name}>{profile?.name ?? 'BookMe user'}</Text>
          <Text style={styles.email}>{profile?.email ?? 'No email connected'}</Text>

          <View style={styles.roleTag}>
            <Ionicons name="ribbon-outline" size={15} color="#DB2777" />
            <Text style={styles.roleText}>{getRoleLabel(profile?.role)}</Text>
          </View>
        </View>

        {profileStats.length > 0 ? (
          <View style={styles.quickStats}>
            {profileStats.map((stat) => (
              <View key={stat.label} style={styles.statTile}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {profile?.role === 'user' ? (
          <View style={styles.panel}>
            <ProfileRow
              icon="heart-outline"
              title="Beauty preferences"
              detail="Favorite services and salons"
              onPress={() => router.push('/favorites')}
            />
          </View>
        ) : null}

        {profile?.role === 'owner' ? (
          <View style={styles.panel}>
            <ProfileRow
              icon="notifications-outline"
              title="Reminders"
              detail="Upcoming bookings by salon"
              onPress={() => router.push('/reminders')}
            />
          </View>
        ) : null}

        {profile?.role === 'admin' ? (
          <View style={styles.panel}>
            <ProfileRow
              icon="stats-chart-outline"
              title="Statistics"
              detail="Bookings, salons and gross revenue"
              onPress={() => router.push('/statistics')}
            />
          </View>
        ) : null}

        <PrimaryButton
          title="Sign out"
          variant="secondary"
          loading={loading}
          onPress={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({
  icon,
  title,
  detail,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  onPress?: () => void;
}) {
  const RowContainer = onPress ? Pressable : View;

  return (
    <RowContainer style={styles.row} onPress={onPress}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color="#DB2777" />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D68AAD" />
    </RowContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7FB',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCE7F3',
  },
  profileHero: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 28,
    padding: 24,
    gap: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DB2777',
    marginBottom: 6,
  },
  avatarText: {
    fontFamily: themeFonts.display,
    fontSize: 31,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontFamily: themeFonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#3B0A24',
    textAlign: 'center',
  },
  email: {
    fontFamily: themeFonts.body,
    fontSize: 15,
    color: '#8A4562',
    textAlign: 'center',
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FCE7F3',
  },
  roleText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#BE185D',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statTile: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#3B0A24',
  },
  statValue: {
    fontFamily: themeFonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: themeFonts.bodyStrong,
    marginTop: 4,
    fontSize: 13,
    color: '#FCE7F3',
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 22,
    padding: 8,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCE7F3',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 15,
    fontWeight: '700',
    color: '#3B0A24',
  },
  rowDetail: {
    fontFamily: themeFonts.body,
    marginTop: 2,
    fontSize: 13,
    color: '#8A4562',
  },
});
