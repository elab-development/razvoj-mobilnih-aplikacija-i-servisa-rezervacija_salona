import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { AdminBarChart } from '@/components/admin/statistics/AdminBarChart';
import { AdminStatCard } from '@/components/admin/statistics/AdminStatCard';
import { useAdminStatistics } from '@/components/admin/statistics/useAdminStatistics';
import { themeFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/roleRoutes';

export default function StatisticsScreen() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const {
    summary,
    bookingsByUser,
    bookingsBySalon,
    revenueBySalon,
    revenueByMonth,
    roleSplit,
    isLoading,
    error,
  } = useAdminStatistics(isAdmin);

  if (!isAdmin) {
    return <Redirect href={getDefaultAppRoute(profile?.role)} />;
  }

  return (
    <AppScreenLayout
      title="Statistics"
      subtitle="Platform overview for bookings, salons and gross revenue."
    >
      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#DB2777" />
          <Text style={styles.stateText}>Loading statistics...</Text>
        </View>
      ) : null}

      {!isLoading && error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Could not load statistics</Text>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : null}

      {!isLoading && !error ? (
        <>
          <View style={styles.statGrid}>
            <AdminStatCard
              icon="people-outline"
              label="Users"
              value={String(summary.totalUsers)}
            />
            <AdminStatCard
              icon="business-outline"
              label="Salons"
              value={String(summary.totalSalons)}
            />
            <AdminStatCard
              icon="calendar-outline"
              label="Confirmed bookings"
              value={String(summary.confirmedBookings)}
            />
            <AdminStatCard
              icon="close-circle-outline"
              label="Cancelled bookings"
              value={String(summary.cancelledBookings)}
            />
          </View>

          <View style={styles.revenuePanel}>
            <View style={styles.revenueIcon}>
              <Ionicons name="cash-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.revenueContent}>
              <Text style={styles.revenueLabel}>Total gross revenue</Text>
              <Text style={styles.revenueValue}>
                {formatCurrency(summary.grossRevenue)}
              </Text>
              <Text style={styles.revenueHint}>
                Average booking value: {formatCurrency(summary.averageBookingValue)}
              </Text>
            </View>
          </View>

          <AdminBarChart
            title="Bookings by user"
            data={bookingsByUser}
            valueSuffix=" bookings"
          />
          <AdminBarChart
            title="Bookings by salon"
            data={bookingsBySalon}
            valueSuffix=" bookings"
          />
          <AdminBarChart
            title="Gross revenue by salon"
            data={revenueBySalon}
            formatValue={formatCurrency}
          />
          <AdminBarChart
            title="Revenue by month"
            data={revenueByMonth}
            formatValue={formatCurrency}
          />
          <AdminBarChart
            title="Users by role"
            data={roleSplit}
            valueSuffix=" users"
          />
        </>
      ) : null}
    </AppScreenLayout>
  );
}

function formatCurrency(value: number) {
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })} RSD`;
}

const styles = StyleSheet.create({
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  revenuePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#3B0A24',
  },
  revenueIcon: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#DB2777',
  },
  revenueContent: {
    flex: 1,
    gap: 3,
  },
  revenueLabel: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#FBCFE8',
  },
  revenueValue: {
    fontFamily: themeFonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  revenueHint: {
    fontFamily: themeFonts.body,
    fontSize: 13,
    color: '#FCE7F3',
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
