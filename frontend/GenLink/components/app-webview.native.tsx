import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  uri: string;
};

export default function AppWebView({ uri }: Props) {
  const [WebViewModule, setWebViewModule] = useState<any | null>(null);
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    (async () => {
      try {
        // dynamic import avoids static bundler import which fails when not installed.
        const mod = await import('react-native-webview');
        setWebViewModule(mod?.WebView ?? mod?.default ?? mod);
      } catch {
      setWebViewModule(null);
      // keep a console warning so it's easy to see in logs
       
        console.warn('react-native-webview not installed. Run `expo install react-native-webview`.');
    }
      })();
      }, []);

  let content: React.ReactNode;

  if (!WebViewModule) {
    content = (
      <View style={styles.loadingContainer}>
        <ThemedText>Nie znaleziono pakietu `react-native-webview`.</ThemedText>
        <ThemedText>Uruchom w terminalu:</ThemedText>
        <ThemedText style={{ fontFamily: 'monospace' }}>expo install react-native-webview</ThemedText>
        <View style={{ marginTop: 12 }}>
          <Button title="Otwórz w przeglądarce" onPress={() => void Linking.openURL(uri)} />
        </View>
      </View>
    );
  } else {
    const RNWebView = WebViewModule;
    content = (
      <RNWebView
        source={{ uri }}
        // iOS: disable bounce
        bounces={false}
        // Android: disable the overscroll glow/stretch
        overScrollMode="never"
        // Disable built-in pull-to-refresh on Android
        pullToRefreshEnabled={false}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <ThemedText>Ładowanie…</ThemedText>
          </View>
        )}
        style={[styles.webview, { backgroundColor }]}
      />
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <ThemedView style={styles.container}>{content}</ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  webview: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
