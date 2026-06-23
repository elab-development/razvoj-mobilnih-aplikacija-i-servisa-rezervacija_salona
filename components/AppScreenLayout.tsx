import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { themeFonts } from '@/constants/theme';

type AppScreenLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AppScreenLayout({
  title,
  subtitle,
  children,
}: AppScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7FB',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 22,
  },
  title: {
    fontFamily: themeFonts.display,
    fontSize: 30,
    fontWeight: '700',
    color: '#3B0A24',
  },
  subtitle: {
    fontFamily: themeFonts.body,
    marginTop: 8,
    fontSize: 16,
    color: '#8A4562',
    lineHeight: 22,
  },
  body: {
    gap: 16,
  },
});
