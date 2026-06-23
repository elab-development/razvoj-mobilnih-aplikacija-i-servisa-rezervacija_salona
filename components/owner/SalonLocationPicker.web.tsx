import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { OwnerFormField } from '@/components/owner/OwnerFormField';
import { themeFonts } from '@/constants/theme';
import type { Salon } from '@/types/salon';

type SalonLocation = Salon['location'];

type SalonLocationPickerProps = {
  value: SalonLocation;
  errors?: Partial<Record<'street' | 'city' | 'coordinates', string>>;
  onChange: (value: SalonLocation) => void;
};

export function SalonLocationPicker({
  value,
  errors,
  onChange,
}: SalonLocationPickerProps) {
  const [search, setSearch] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const setSelectedCoordinates = async (latitude: number, longitude: number) => {
    const nextLocation = {
      ...value,
      latitude,
      longitude,
    };

    onChange(nextLocation);
    await reverseGeocode(latitude, longitude, nextLocation);
  };

  const searchLocation = async () => {
    if (!search.trim()) {
      setLocationError('Enter a street, salon area or city to search.');
      return;
    }

    setIsResolving(true);
    setLocationError(null);

    try {
      const results = await Location.geocodeAsync(search.trim());
      const firstResult = results[0];

      if (!firstResult) {
        setLocationError('No location found for that search.');
        return;
      }

      await setSelectedCoordinates(firstResult.latitude, firstResult.longitude);
    } catch {
      setLocationError('Search failed. Try a more specific address.');
    } finally {
      setIsResolving(false);
    }
  };

  const useBrowserLocation = async () => {
    setIsResolving(true);
    setLocationError(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setLocationError('Location permission is required to use current location.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      await setSelectedCoordinates(
        position.coords.latitude,
        position.coords.longitude,
      );
    } catch {
      setLocationError('Current location could not be loaded.');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Location</Text>

      <View style={styles.searchRow}>
        <OwnerFormField
          label="Search address"
          value={search}
          onChangeText={setSearch}
          placeholder="Search street, area or city"
          containerStyle={styles.searchInput}
          autoCapitalize="words"
        />
        <Pressable
          style={[styles.searchButton, isResolving && styles.disabledButton]}
          onPress={searchLocation}
          disabled={isResolving}
        >
          {isResolving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons name="search" size={20} color="#FFFFFF" />
          )}
        </Pressable>
      </View>

      <View style={styles.webMapFallback}>
        <Ionicons name="map-outline" size={28} color="#DB2777" />
        <Text style={styles.webMapTitle}>Map is available on mobile</Text>
        <Text style={styles.webMapText}>
          Web build uses search and current location. On phone, this same field
          opens the interactive map with marker drag and zoom.
        </Text>
      </View>

      <Pressable
        style={[styles.currentButton, isResolving && styles.disabledButton]}
        onPress={useBrowserLocation}
        disabled={isResolving}
      >
        <Ionicons name="locate-outline" size={18} color="#DB2777" />
        <Text style={styles.currentButtonText}>Use current location</Text>
      </Pressable>

      <View style={styles.addressFields}>
        <OwnerFormField
          label="Street"
          value={value.street}
          onChangeText={(street) => onChange({ ...value, street })}
          error={errors?.street}
        />
        <OwnerFormField
          label="City"
          value={value.city}
          onChangeText={(city) => onChange({ ...value, city })}
          error={errors?.city}
        />
      </View>

      <View style={styles.coordinateBox}>
        <Text style={styles.coordinateLabel}>Coordinates</Text>
        <Text style={styles.coordinateText}>
          {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
        </Text>
        <Text style={styles.coordinateHint}>
          Coordinates are set from search, current location or the mobile map.
        </Text>
      </View>

      {errors?.coordinates ? (
        <Text style={styles.error}>{errors.coordinates}</Text>
      ) : null}
      {locationError ? <Text style={styles.error}>{locationError}</Text> : null}
    </View>
  );

  async function reverseGeocode(
    latitude: number,
    longitude: number,
    currentLocation: SalonLocation,
  ) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const address = addresses[0];

      if (!address) {
        return;
      }

      onChange({
        ...currentLocation,
        street: formatStreet(address) || currentLocation.street,
        city:
          address.city ||
          address.subregion ||
          address.region ||
          currentLocation.city,
      });
    } catch {
      setLocationError('Address lookup failed. You can edit street and city manually.');
    }
  }
}

function formatStreet(address: Location.LocationGeocodedAddress) {
  return [address.streetNumber, address.street]
    .filter(Boolean)
    .join(' ')
    .trim();
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  sectionLabel: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#831843',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  searchInput: {
    flex: 1,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DB2777',
  },
  disabledButton: {
    opacity: 0.65,
  },
  webMapFallback: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 20,
    backgroundColor: '#FFF7FB',
    padding: 18,
    gap: 6,
  },
  webMapTitle: {
    fontFamily: themeFonts.display,
    fontSize: 20,
    fontWeight: '700',
    color: '#3B0A24',
    textAlign: 'center',
  },
  webMapText: {
    fontFamily: themeFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: '#8A4562',
    textAlign: 'center',
  },
  currentButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F9A8D4',
    borderRadius: 14,
    backgroundColor: '#FFF1F7',
  },
  currentButtonText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 14,
    fontWeight: '700',
    color: '#DB2777',
  },
  addressFields: {
    gap: 12,
  },
  coordinateBox: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFF7FB',
    gap: 4,
  },
  coordinateLabel: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 12,
    fontWeight: '700',
    color: '#831843',
  },
  coordinateText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 15,
    fontWeight: '700',
    color: '#3B0A24',
  },
  coordinateHint: {
    fontFamily: themeFonts.body,
    fontSize: 12,
    color: '#8A4562',
  },
  error: {
    fontFamily: themeFonts.body,
    fontSize: 12,
    color: '#E11D48',
  },
});
