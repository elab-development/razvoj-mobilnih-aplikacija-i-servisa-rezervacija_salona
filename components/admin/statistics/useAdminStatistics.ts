import { collection, getDocs } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { db } from '@/lib/firebase';
import type { Booking } from '@/types/booking';
import type { Salon } from '@/types/salon';
import type { UserProfile } from '@/types/user';

export type AdminStatisticBooking = Booking & {
  id: string;
};

export type AdminStatisticSalon = Salon & {
  id: string;
};

export type AdminStatisticUser = UserProfile & {
  id: string;
};

export type ChartDatum = {
  id: string;
  label: string;
  value: number;
  helper?: string;
};

export function useAdminStatistics(enabled = true) {
  const [bookings, setBookings] = useState<AdminStatisticBooking[]>([]);
  const [salons, setSalons] = useState<AdminStatisticSalon[]>([]);
  const [users, setUsers] = useState<AdminStatisticUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    if (!enabled) {
      setBookings([]);
      setSalons([]);
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [bookingSnapshot, salonSnapshot, userSnapshot] = await Promise.all([
        getDocs(collection(db, 'bookings')),
        getDocs(collection(db, 'salons')),
        getDocs(collection(db, 'users')),
      ]);

      setBookings(
        bookingSnapshot.docs.map((bookingDoc) => ({
          id: bookingDoc.id,
          ...(bookingDoc.data() as Booking),
        })),
      );
      setSalons(
        salonSnapshot.docs.map((salonDoc) => ({
          id: salonDoc.id,
          ...(salonDoc.data() as Salon),
        })),
      );
      setUsers(
        userSnapshot.docs.map((userDoc) => ({
          id: userDoc.id,
          ...(userDoc.data() as UserProfile),
        })),
      );
    } catch {
      setError('Unable to load statistics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const statistics = useMemo(() => {
    const confirmedBookings = bookings.filter(
      (booking) => booking.status === 'confirmed',
    );
    const cancelledBookings = bookings.filter(
      (booking) => booking.status === 'cancelled',
    );
    const grossRevenue = sumRevenue(confirmedBookings);
    const averageBookingValue =
      confirmedBookings.length > 0
        ? Math.round(grossRevenue / confirmedBookings.length)
        : 0;

    return {
      summary: {
        totalUsers: users.length,
        totalSalons: salons.length,
        confirmedBookings: confirmedBookings.length,
        cancelledBookings: cancelledBookings.length,
        grossRevenue,
        averageBookingValue,
      },
      bookingsByUser: topRows(
        Array.from(groupBookingsByUser(confirmedBookings).values()),
      ),
      bookingsBySalon: topRows(
        Array.from(groupBookingsBySalon(confirmedBookings).values()),
      ),
      revenueBySalon: topRows(
        Array.from(groupRevenueBySalon(confirmedBookings).values()),
      ),
      revenueByMonth: buildMonthlyRevenue(confirmedBookings),
      roleSplit: buildRoleSplit(users),
    };
  }, [bookings, salons, users]);

  return {
    ...statistics,
    bookings,
    salons,
    users,
    isLoading,
    error,
    refetch: fetchStatistics,
  };
}

function sumRevenue(bookings: AdminStatisticBooking[]) {
  return bookings.reduce((sum, booking) => sum + booking.priceRsd, 0);
}

function topRows(rows: ChartDatum[], limit = 6) {
  return rows
    .sort((first, second) => second.value - first.value)
    .slice(0, limit);
}

function groupBookingsByUser(bookings: AdminStatisticBooking[]) {
  const groups = new Map<string, ChartDatum>();

  bookings.forEach((booking) => {
    const label = booking.userName || booking.userEmail || 'Unknown user';
    const helper = booking.userEmail;
    const current = groups.get(booking.userId);

    groups.set(booking.userId, {
      id: booking.userId,
      label,
      helper,
      value: (current?.value ?? 0) + 1,
    });
  });

  return groups;
}

function groupBookingsBySalon(bookings: AdminStatisticBooking[]) {
  const groups = new Map<string, ChartDatum>();

  bookings.forEach((booking) => {
    const current = groups.get(booking.salonId);

    groups.set(booking.salonId, {
      id: booking.salonId,
      label: booking.salonName || 'Unknown salon',
      value: (current?.value ?? 0) + 1,
    });
  });

  return groups;
}

function groupRevenueBySalon(bookings: AdminStatisticBooking[]) {
  const groups = new Map<string, ChartDatum>();

  bookings.forEach((booking) => {
    const current = groups.get(booking.salonId);

    groups.set(booking.salonId, {
      id: booking.salonId,
      label: booking.salonName || 'Unknown salon',
      value: (current?.value ?? 0) + booking.priceRsd,
    });
  });

  return groups;
}

function buildMonthlyRevenue(bookings: AdminStatisticBooking[]) {
  const months = getLastMonthKeys(6);
  const revenueByMonth = new Map(
    months.map((monthKey) => [
      monthKey,
      {
        id: monthKey,
        label: formatMonthLabel(monthKey),
        value: 0,
      },
    ]),
  );

  bookings.forEach((booking) => {
    const monthKey = booking.date.slice(0, 7);
    const current = revenueByMonth.get(monthKey);

    if (!current) {
      return;
    }

    current.value += booking.priceRsd;
  });

  return Array.from(revenueByMonth.values());
}

function buildRoleSplit(users: AdminStatisticUser[]) {
  const roleLabels = {
    admin: 'Admins',
    owner: 'Owners',
    user: 'Users',
  };

  return Object.entries(roleLabels).map(([role, label]) => ({
    id: role,
    label,
    value: users.filter((user) => user.role === role).length,
  }));
}

function getLastMonthKeys(count: number) {
  const now = new Date();

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${date.getFullYear()}-${month}`;
  });
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
  });
}
