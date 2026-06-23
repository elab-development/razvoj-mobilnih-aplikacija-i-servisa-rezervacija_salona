import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioStatus,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';

const bookingConfirmedSound = require('@/assets/sounds/booking-confirmed.wav');

export async function playBookingConfirmationFeedback() {
  await Promise.all([
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    ),
    playBookingConfirmationSound(),
  ]);
}

async function playBookingConfirmationSound() {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    });

    const player = createAudioPlayer(bookingConfirmedSound, {
      updateInterval: 100,
      keepAudioSessionActive: true,
    });
    player.volume = 0.7;

    const subscription = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      if (status.didJustFinish) {
        subscription.remove();
        player.remove();
      }
    });
    player.play();

    setTimeout(() => {
      subscription.remove();
      player.remove();
    }, 1500);
  } catch {
    // Booking creation should never fail because device feedback is unavailable.
  }
}
