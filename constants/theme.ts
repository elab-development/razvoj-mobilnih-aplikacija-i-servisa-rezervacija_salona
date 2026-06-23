import { Platform } from 'react-native';

export const themeFonts = {
  display: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia',
  }),
  body: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif',
    default: 'Trebuchet MS',
  }),
  bodyStrong: Platform.select({
    ios: 'Avenir Next Demi Bold',
    android: 'sans-serif-medium',
    default: 'Trebuchet MS',
  }),
};
