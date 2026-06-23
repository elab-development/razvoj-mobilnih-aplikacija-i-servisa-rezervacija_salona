import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { AdminUser } from '@/components/admin/useAdminUsers';
import { themeFonts } from '@/constants/theme';

export function AdminUsersTab({
  users,
  isLoading,
  error,
}: {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
}) {
  if (isLoading) {
    return <AdminState message="Loading users..." loading />;
  }

  if (error) {
    return <AdminState title="Could not load users" message={error} />;
  }

  return (
    <View style={styles.list}>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </View>
  );
}

function UserCard({ user }: { user: AdminUser }) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Ionicons name="person-outline" size={22} color="#DB2777" />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.name}>{user.name || 'Unnamed user'}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <Text style={styles.role}>{user.role}</Text>
    </View>
  );
}

function AdminState({
  title,
  message,
  loading = false,
}: {
  title?: string;
  message: string;
  loading?: boolean;
}) {
  return (
    <View style={styles.stateBox}>
      {loading ? <ActivityIndicator color="#DB2777" /> : null}
      {title ? <Text style={styles.stateTitle}>{title}</Text> : null}
      <Text style={styles.stateText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCE7F3',
  },
  userInfo: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 16,
    fontWeight: '700',
    color: '#3B0A24',
  },
  email: {
    fontFamily: themeFonts.body,
    fontSize: 13,
    color: '#8A4562',
  },
  role: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FCE7F3',
    color: '#BE185D',
    fontFamily: themeFonts.bodyStrong,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stateBox: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 18,
    padding: 18,
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
    color: '#8A4562',
    textAlign: 'center',
  },
});
