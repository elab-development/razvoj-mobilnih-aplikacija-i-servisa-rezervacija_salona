import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/roleRoutes';

export default function AdminScreen() {
  const { profile } = useAuth();

  if (profile?.role !== 'admin') {
    return <Redirect href={getDefaultAppRoute(profile?.role)} />;
  }

  return (
    <AppScreenLayout
      title="Admin"
      subtitle="Platform-level tools for user, owner and salon oversight."
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Admin area</Text>
        <Text style={styles.cardText}>
          Admin accounts are not created from registration. Set the role to
          admin in the users collection when you want platform access.
        </Text>
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  cardTitle: {
    fontFamily: themeFonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#3B0A24',
  },
  cardText: {
    fontFamily: themeFonts.body,
    fontSize: 15,
    color: '#8A4562',
    lineHeight: 21,
  },
});
