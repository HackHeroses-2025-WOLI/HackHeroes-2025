import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import NetInfo from '@react-native-community/netinfo';
import * as SplashScreen from 'expo-splash-screen';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { WebView } from 'react-native-webview';

type Props = {
  uri: string;
};

export default function AppWebView({ uri }: Props) {
  const [WebViewModule, setWebViewModule] = useState<any | null>(null);
  const [errorState, setErrorState] = useState<'network' | 'http' | null>(null);
  const [hasConnection, setHasConnection] = useState(true);
  const splashHiddenRef = useRef(false);
  const webViewRef = useRef<WebView | null>(null);
  const previousConnectionRef = useRef(true);
  const backgroundColor = useThemeColor({}, 'background');

  const hideSplash = useCallback(async () => {
    if (splashHiddenRef.current) return;
    splashHiddenRef.current = true;
    try {
      await SplashScreen.hideAsync();
    } catch (error) {
      console.warn('Unable to hide splash screen', error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // dynamic import avoids static bundler import which fails when not installed.
        const mod = await import('react-native-webview');
        if (!isMounted) return;
        setWebViewModule(mod?.WebView ?? mod?.default ?? mod);
      } catch (error) {
        if (!isMounted) return;
        setWebViewModule(null);
        console.warn('react-native-webview not installed. Run `expo install react-native-webview`.', error);
        hideSplash();
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [hideSplash]);

  useEffect(() => {
    setErrorState(null);
  }, [uri]);

  useEffect(() => {
    let isMounted = true;
    const checkConnection = async () => {
      try {
        const state = await NetInfo.fetch();
        if (!isMounted) return;
        const connected = Boolean(state.isConnected && state.isInternetReachable !== false);
        setHasConnection(connected);
      } catch {
        if (!isMounted) return;
        setHasConnection(false);
      }
    };

    checkConnection();
    const intervalId = setInterval(checkConnection, 500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleLoad = useCallback(() => {
    setErrorState(null);
    hideSplash();
  }, [hideSplash]);

  const handleError = useCallback(() => {
    setErrorState('network');
    hideSplash();
  }, [hideSplash]);

  const handleHttpError = useCallback(() => {
    setErrorState('http');
    hideSplash();
  }, [hideSplash]);

  const handleRetry = useCallback(() => {
    setErrorState(null);
    webViewRef.current?.reload();
  }, []);

  useEffect(() => {
    if (!hasConnection) {
      setErrorState('network');
      hideSplash();
    } else if (!previousConnectionRef.current && hasConnection) {
      setErrorState(null);
      webViewRef.current?.reload();
    }
    previousConnectionRef.current = hasConnection;
  }, [hasConnection, hideSplash]);

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
      <View style={styles.webWrapper}>
        <RNWebView
          ref={(ref: WebView | null) => {
            webViewRef.current = ref;
          }}
          source={{ uri }}
          // iOS: disable bounce
          bounces={false}
          // Android: disable the overscroll glow/stretch
          overScrollMode="never"
          // Disable built-in pull-to-refresh on Android
          pullToRefreshEnabled={false}
          // Prevent zooming/resizing interactions
          scalesPageToFit={false}
          textZoom={100}
          setBuiltInZoomControls={false}
          setDisplayZoomControls={false}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <ThemedText>Ładowanie…</ThemedText>
            </View>
          )}
          onLoad={handleLoad}
          onError={() => handleError()}
          onHttpError={() => handleHttpError()}
          style={[styles.webview, { backgroundColor }]}
        />
        {errorState && <ErrorNotice onRetry={handleRetry} />}
      </View>
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

type ErrorNoticeProps = {
  onRetry: () => void;
};

function ErrorNotice({ onRetry }: ErrorNoticeProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.errorOverlay,
        {
          paddingTop: 48 + insets.top,
          paddingBottom: 36 + insets.bottom,
        },
      ]}
    >
      <ThemedText style={styles.errorTitle}>Ups!</ThemedText>
      <ThemedText style={styles.errorSubtitle}>Coś poszło nie tak</ThemedText>
      <View style={styles.lottieContainer}>
        <LottieView
          source={require('@/assets/animations/error-icon-lottie.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
      <View style={styles.errorBottom}>
        <ThemedText style={styles.errorHint}>Sprawdź połączenie lub spróbuj wczytać stronę ponownie.</ThemedText>
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <ThemedText style={styles.retryButtonText}>Spróbuj ponownie</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  webWrapper: { flex: 1 },
  webview: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  errorTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 45,
    color: '#05060a',
    textAlign: 'center',
    lineHeight: 44,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorSubtitle: {
    fontFamily: Fonts.rounded,
    fontSize: 35,
    color: '#05060a',
    textAlign: 'center',
    lineHeight: 44,
    fontWeight: '500',
    marginBottom: 12,
  },
  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  lottie: {
    width: 320,
    height: 320,
  },
  errorHint: {
    textAlign: 'left',
    fontSize: 16,
    color: '#2b3039',
    marginBottom: 28,
    lineHeight: 24,
  },
  errorBottom: {
    marginTop: 'auto',
  },
  retryButton: {
    backgroundColor: '#0b0f19',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});
