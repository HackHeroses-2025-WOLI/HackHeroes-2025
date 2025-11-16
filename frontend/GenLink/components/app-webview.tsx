import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { WebView as RNWebView } from 'react-native-webview';

type Props = {
  uri: string;
};

export function AppWebView({ uri }: Props) {
  // On web we use an iframe fallback for better performance and compatibility
  if (Platform.OS === 'web') {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <iframe
          title={uri}
          src={uri}
          style={{ width: '100%', height: '100%', border: 0 }}
          sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts"
        />
      </div>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <RNWebView
        source={{ uri }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <ThemedText>Ładowanie…</ThemedText>
          </View>
        )}
        style={styles.webview}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
