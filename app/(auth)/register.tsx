import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthScreenLayout } from '@/components/AuthScreenLayout';
import { AuthTextField } from '@/components/AuthTextField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import type { RegistrationRole } from '@/types/user';

type RoleOption = {
  value: RegistrationRole;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const roleOptions: RoleOption[] = [
  {
    value: 'user',
    title: 'Client',
    description: 'Book beauty, hair and wellness appointments.',
    icon: 'heart-outline',
  },
  {
    value: 'owner',
    title: 'Salon owner',
    description: 'Prepare your salon profile and manage bookings.',
    icon: 'business-outline',
  },
];

function getAuthErrorMessage(error: unknown) {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : null;

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    default:
      return 'Registration failed. Please try again.';
  }
}

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<RegistrationRole>('user');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, name, password, role);
    } catch (error) {
      Alert.alert('Error', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="Create an account"
      subtitle="Choose how you want to use BookMe. You can sign in later with email and password only."
      footer={
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Link href="/login" style={styles.link}>
            Sign in
          </Link>
        </Text>
      }
    >
      <View style={styles.roleGrid}>
        {roleOptions.map((option) => {
          const selected = role === option.value;

          return (
            <Pressable
              key={option.value}
              style={[styles.roleCard, selected && styles.roleCardSelected]}
              onPress={() => setRole(option.value)}
            >
              <View
                style={[
                  styles.roleIcon,
                  selected && styles.roleIconSelected,
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={selected ? '#FFFFFF' : '#DB2777'}
                />
              </View>
              <Text style={styles.roleTitle}>{option.title}</Text>
              <Text style={styles.roleDescription}>{option.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <AuthTextField
        label="Name"
        value={name}
        onChangeText={setName}
        autoComplete="name"
        placeholder="Your name"
      />

      <AuthTextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="name@example.com"
      />

      <AuthTextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        placeholder="At least 6 characters"
      />

      <AuthTextField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoComplete="new-password"
        placeholder="Repeat your password"
      />

      <PrimaryButton title="Sign up" loading={loading} onPress={handleRegister} />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  roleGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    minHeight: 148,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  roleCardSelected: {
    borderColor: '#DB2777',
    backgroundColor: '#FDF2F8',
  },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCE7F3',
  },
  roleIconSelected: {
    backgroundColor: '#DB2777',
  },
  roleTitle: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 15,
    fontWeight: '800',
    color: '#3B0A24',
  },
  roleDescription: {
    fontFamily: themeFonts.body,
    fontSize: 12,
    color: '#8A4562',
    lineHeight: 17,
  },
  footerText: {
    fontFamily: themeFonts.body,
    fontSize: 15,
    color: '#8A4562',
  },
  link: {
    fontFamily: themeFonts.bodyStrong,
    color: '#DB2777',
    fontWeight: '800',
  },
});
