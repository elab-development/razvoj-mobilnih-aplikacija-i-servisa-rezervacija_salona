import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AuthScreenLayout } from '@/components/AuthScreenLayout';
import { AuthTextField } from '@/components/AuthTextField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

function getAuthErrorMessage(error: unknown) {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : null;

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Sign in failed. Please try again.';
  }
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Error', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="Welcome back"
      subtitle="Sign in to manage bookings, discover salons, or open your owner dashboard."
      footer={
        <Text style={styles.footerText}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={styles.link}>
            Create one
          </Link>
        </Text>
      }
    >
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
        autoComplete="password"
        placeholder="Enter your password"
      />

      <PrimaryButton title="Sign in" loading={loading} onPress={handleLogin} />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
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
