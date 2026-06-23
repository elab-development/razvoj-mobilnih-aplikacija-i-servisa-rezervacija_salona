import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { SalonDiscoveryCard } from '@/components/home/SalonDiscoveryCard';
import { useFavoriteSalons } from '@/components/home/useFavoriteSalons';
import {
  useAvailableSalons,
  type AvailableSalon,
} from '@/components/home/useAvailableSalons';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/roleRoutes';

export default function HomeScreen() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const { salons, isLoading, error } = useAvailableSalons();
  const {
    favoriteSet,
    error: favoritesError,
    toggleFavorite,
  } = useFavoriteSalons(user?.uid);
  const [search, setSearch] = useState('');
  const [nearbyMode, setNearbyMode] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [favoriteLoadingSalonId, setFavoriteLoadingSalonId] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const visibleSalons = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filteredSalons = normalizedSearch
      ? salons.filter((salon) => matchesSalonSearch(salon, normalizedSearch))
      : salons;

    const withDistance = userLocation
      ? filteredSalons.map((salon) => ({
          ...salon,
          distanceKm: calculateDistanceKm(userLocation, salon.location),
        }))
      : filteredSalons;

    if (!nearbyMode || !userLocation) {
      return withDistance;
    }

    return [...withDistance].sort(
      (first, second) => (first.distanceKm ?? 0) - (second.distanceKm ?? 0),
    );
  }, [nearbyMode, salons, search, userLocation]);

  if (profile?.role !== 'user') {
    return <Redirect href={getDefaultAppRoute(profile?.role)} />;
  }

  const handleNearbyPress = async () => {
    setLocationError(null);

    if (userLocation) {
      setNearbyMode((current) => !current);
      return;
    }

    setIsLocating(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setLocationError('Location permission is required to sort by distance.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setNearbyMode(true);
    } catch {
      setLocationError('Could not get your current location.');
    } finally {
      setIsLocating(false);
    }
  };

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
      title={`Hi, ${profile?.name ?? 'there'}`}
      subtitle="Find active salons and book your next appointment."
    >
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={19} color="#B9819F" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search salons"
            placeholderTextColor="#B9819F"
            style={styles.searchInput}
          />
        </View>

        <Pressable
          style={[
            styles.nearbyButton,
            nearbyMode && styles.nearbyButtonActive,
            isLocating && styles.disabledButton,
          ]}
          onPress={handleNearbyPress}
          disabled={isLocating}
        >
          {isLocating ? (
            <ActivityIndicator color={nearbyMode ? '#FFFFFF' : '#DB2777'} />
          ) : (
            <Ionicons
              name="navigate-outline"
              size={21}
              color={nearbyMode ? '#FFFFFF' : '#DB2777'}
            />
          )}
        </Pressable>
      </View>

      {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}
      {favoritesError ? <Text style={styles.errorText}>{favoritesError}</Text> : null}
      {favoriteError ? <Text style={styles.errorText}>{favoriteError}</Text> : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {nearbyMode ? 'Nearest salons' : 'Available salons'}
        </Text>
        <Text style={styles.sectionCount}>{visibleSalons.length}</Text>
      </View>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#DB2777" />
          <Text style={styles.stateText}>Loading salons...</Text>
        </View>
      ) : null}

      {!isLoading && error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Could not load salons</Text>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : null}

      {!isLoading && !error && visibleSalons.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>No salons found</Text>
          <Text style={styles.stateText}>
            Try a different search term or check again after salons are approved.
          </Text>
        </View>
      ) : null}

      {!isLoading && !error
        ? visibleSalons.map((salon) => (
            <SalonDiscoveryCard
              key={salon.id}
              salon={salon}
              isFavorite={favoriteSet.has(salon.id)}
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

function matchesSalonSearch(salon: AvailableSalon, search: string) {
  return [
    salon.name,
    salon.description,
    salon.category,
    salon.location.city,
    salon.location.street,
  ].some((value) => value.toLowerCase().includes(search));
}

function calculateDistanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const earthRadiusKm = 6371;
  const latitudeDelta = degreesToRadians(to.latitude - from.latitude);
  const longitudeDelta = degreesToRadians(to.longitude - from.longitude);
  const fromLatitude = degreesToRadians(from.latitude);
  const toLatitude = degreesToRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function degreesToRadians(value: number) {
  return value * (Math.PI / 180);
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: themeFonts.body,
    fontSize: 16,
    color: '#3B0A24',
  },
  nearbyButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F9A8D4',
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
  },
  nearbyButtonActive: {
    borderColor: '#DB2777',
    backgroundColor: '#DB2777',
  },
  disabledButton: {
    opacity: 0.65,
  },
  errorText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#E11D48',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: themeFonts.display,
    fontSize: 25,
    fontWeight: '700',
    color: '#3B0A24',
  },
  sectionCount: {
    overflow: 'hidden',
    minWidth: 32,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#DB2777',
    color: '#FFFFFF',
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
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
