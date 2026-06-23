import type { Booking } from '@/types/booking';
import type { Salon, Service, WeekDay } from '@/types/salon';

const weekDayKeys: WeekDay[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function getUpcomingDates(days = 14) {
  const dates: string[] = [];
  const today = new Date();

  for (let index = 0; index < days; index += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    dates.push(formatDateKey(date));
  }

  return dates;
}

export function getAvailableSlots({
  bookings,
  date,
  salon,
  service,
}: {
  bookings: Booking[];
  date: string;
  salon: Salon;
  service: Service;
}) {
  const workingDay = salon.workingHours[getWeekDayKey(date)];

  if (!workingDay?.isOpen || !workingDay.opensAt || !workingDay.closesAt) {
    return [];
  }

  const opensAt = workingDay.opensAt;
  const closesAt = workingDay.closesAt;

  return service.availableTimeSlots.filter((slot) => {
    if (isPastSlot(date, slot)) {
      return false;
    }

    const slotStart = toMinutes(slot);
    const slotEnd = slotStart + service.durationMinutes;

    if (
      slotStart < toMinutes(opensAt) ||
      slotEnd > toMinutes(closesAt)
    ) {
      return false;
    }

    return !bookings.some((booking) => {
      if (booking.date !== date || booking.status === 'cancelled') {
        return false;
      }

      const bookingStart = toMinutes(booking.startsAt);
      const bookingEnd = toMinutes(booking.endsAt);
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  });
}

export function getWeekDayKey(date: string) {
  return weekDayKeys[new Date(`${date}T00:00:00`).getDay()];
}

export function formatDateLabel(date: string) {
  const value = new Date(`${date}T00:00:00`);
  return value.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function addMinutes(time: string, minutes: number) {
  return toTime(toMinutes(time) + minutes);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isPastSlot(date: string, slot: string) {
  return new Date(`${date}T${slot}:00`).getTime() <= Date.now();
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function toTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
