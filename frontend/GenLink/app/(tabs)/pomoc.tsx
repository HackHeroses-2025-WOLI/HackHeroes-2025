import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import AppWebView from '@/components/app-webview';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BASE_URL } from '@/constants/config';
import { Fonts } from '@/constants/theme';

export default function PomocScreen() {
  const url = `${BASE_URL}/pomoc`;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Link href="/">
          <Link.Trigger>
            <ThemedText type="subtitle">← Powrót</ThemedText>
          </Link.Trigger>
        </Link>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Pomoc
        </ThemedText>
      </ThemedView>

      <AppWebView uri={url} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
