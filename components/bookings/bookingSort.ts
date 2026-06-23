import type { Booking } from '@/types/booking';

export type UserBooking = Booking & {
  id: string;
};

export function sortUserBookings(bookings: UserBooking[]) {
  return [...bookings].sort((first, second) => {
    const firstTime = getBookingDateTime(first).getTime();
    const secondTime = getBookingDateTime(second).getTime();
    const now = Date.now();
    const firstCancelled = first.status === 'cancelled';
    const secondCancelled = second.status === 'cancelled';

    if (firstCancelled !== secondCancelled) {
      return firstCancelled ? 1 : -1;
    }

    const firstPast = firstTime < now;
    const secondPast = secondTime < now;

    if (firstPast !== secondPast) {
      return firstPast ? 1 : -1;
    }

    if (firstPast && secondPast) {
      return secondTime - firstTime;
    }

    return firstTime - secondTime;
  });
}

export function isPastBooking(booking: Booking) {
  return getBookingDateTime(booking).getTime() < Date.now();
}

export function formatBookingDate(booking: Booking) {
  return getBookingDateTime(booking).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getBookingDateTime(booking: Booking) {
  return new Date(`${booking.date}T${booking.startsAt}:00`);
}
