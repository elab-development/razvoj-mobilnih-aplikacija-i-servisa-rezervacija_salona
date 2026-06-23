import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { SalonDiscoveryCard } from '@/components/home/SalonDiscoveryCard';
import { useAvailableSalons } from '@/components/home/useAvailableSalons';
import { useFavoriteSalons } from '@/components/home/useFavoriteSalons';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/roleRoutes';

export default function FavoritesScreen() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const { salons, isLoading: salonsLoading, error: salonsError } = useAvailableSalons();
  const {
    favoriteSet,
    isLoading: favoritesLoading,
    error: favoritesError,
    toggleFavorite,
  } = useFavoriteSalons(user?.uid);
  const [favoriteLoadingSalonId, setFavoriteLoadingSalonId] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const favoriteSalons = useMemo(
    () => salons.filter((salon) => favoriteSet.has(salon.id)),
    [favoriteSet, salons],
  );

  if (profile?.role !== 'user') {
    return <Redirect href={getDefaultAppRoute(profile?.role)} />;
  }

  const isLoading = salonsLoading || favoritesLoading;
  const pageError = salonsError ?? favoritesError;

  const handleToggleFavorite = async (salonId: string) => {
    setFavoriteLoadingSalonId(salonId);
    setFavoriteError(null);

    try {
      await toggleFavorite(salonId);
    } catch {
      setFavoriteError('Favorite could not be updated. Please try again.');
    } finally {
      setFavoriteLoadingSalonId(null);
    }
  };

  return (
    <AppScreenLayout
      title="Favorites"
      subtitle="Your saved salons for quick booking."
    >
      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons name="heart" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.summaryTextGroup}>
          <Text style={styles.summaryValue}>{favoriteSalons.length}</Text>
          <Text style={styles.summaryLabel}>
            {favoriteSalons.length === 1 ? 'saved salon' : 'saved salons'}
          </Text>
        </View>
      </View>

      {favoriteError ? <Text style={styles.errorText}>{favoriteError}</Text> : null}

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#DB2777" />
          <Text style={styles.stateText}>Loading favorites...</Text>
        </View>
      ) : null}

      {!isLoading && pageError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Could not load favorites</Text>
          <Text style={styles.stateText}>{pageError}</Text>
        </View>
      ) : null}

      {!isLoading && !pageError && favoriteSalons.length === 0 ? (
        <View style={styles.stateBox}>
          <Ionicons name="heart-outline" size={30} color="#DB2777" />
          <Text style={styles.stateTitle}>No favorites yet</Text>
          <Text style={styles.stateText}>
            Save salons from Home and they will show up here.
          </Text>
        </View>
      ) : null}

      {!isLoading && !pageError
        ? favoriteSalons.map((salon) => (
            <SalonDiscoveryCard
              key={salon.id}
              salon={salon}
              isFavorite
              favoriteLoading={favoriteLoadingSalonId === salon.id}
              onToggleFavorite={() => handleToggleFavorite(salon.id)}
              onBook={() =>
                router.push({
                  pathname: '/salons/[salonId]',
                  params: { salonId: salon.id },
                })
              }
            />
          ))
        : null}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  summaryIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#DB2777',
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryValue: {
    fontFamily: themeFonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#3B0A24',
  },
  summaryLabel: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 14,
    fontWeight: '700',
    color: '#8A4562',
  },
  errorText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#E11D48',
  },
  stateBox: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
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
