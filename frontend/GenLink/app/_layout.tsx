import { FORCE_LIGHT_SYSTEM_UI, FORCE_NAVIGATION_BAR_WHITE } from '@/constants/config';
import { Colors } from '@/constants/theme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, Platform, StatusBar as RNStatusBar } from 'react-native';
import { isEdgeToEdge } from 'react-native-is-edge-to-edge';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

void SplashScreen.preventAutoHideAsync().catch(() => {
  // keep splash visible until the web content signals readiness
});

// Helper so we can retry setting the background color (wrapper around module API)
function NavigationBarSetBackgroundColor(navigationBar: any, color: string) {
  try {
    navigationBar.setBackgroundColorAsync(color);
  } catch {
    try {
      // Some older versions might export it differently
      navigationBar.NavigationBar?.setBackgroundColorAsync?.(color);
    } catch {}
  }
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    (async function setupNavBar() {
      try {
        const navigationBarModule = await import('expo-navigation-bar');
        const navigationBar = navigationBarModule.default ?? navigationBarModule;

        const edgeToEdgeEnabled =
          (Constants?.expoConfig as any)?.android?.edgeToEdgeEnabled ??
          (Constants?.manifest as any)?.android?.edgeToEdgeEnabled ??
          false;
        const runtimeEdgeToEdge = isEdgeToEdge();
        const force = FORCE_LIGHT_SYSTEM_UI || FORCE_NAVIGATION_BAR_WHITE;

        if (force) {
          console.info('FORCE_LIGHT_SYSTEM_UI or FORCE_NAVIGATION_BAR_WHITE is true', {
            force,
            edgeToEdgeEnabled,
            runtimeEdgeToEdge,
          });
          await navigationBar.setPositionAsync('relative');
          NavigationBarSetBackgroundColor(navigationBar, Colors.light.background);
        } else if (!edgeToEdgeEnabled && !runtimeEdgeToEdge) {
          await navigationBar.setPositionAsync('relative');
          await navigationBar.setBackgroundColorAsync(Colors.light.background);
        } else if (runtimeEdgeToEdge) {
          try {
            navigationBar.setStyle?.('light');
          } catch {}
        } else {
          console.info('Edge-to-edge enabled; not changing navigation bar background to avoid warnings.');
        }
        await navigationBar.setButtonStyleAsync('dark');
        if (FORCE_LIGHT_SYSTEM_UI || FORCE_NAVIGATION_BAR_WHITE) {
          await navigationBar.setButtonStyleAsync('dark');
        }
      } catch {
        console.warn(
          'expo-navigation-bar not installed. Run `expo install expo-navigation-bar` to control the system navigation bar on Android.'
        );
      }
    })();

    // ensure status/navigation bar colors restored when app comes back from background
    const applyColors = async () => {
      try {
        RNStatusBar.setBackgroundColor(Colors.light.background, true);
        RNStatusBar.setBarStyle('dark-content', true);

        const navigationBarModule = await import('expo-navigation-bar');
        const navigationBar = navigationBarModule.default ?? navigationBarModule;
        const runtimeEdgeToEdge = isEdgeToEdge();
        const edgeToEdgeEnabled =
          (Constants?.expoConfig as any)?.android?.edgeToEdgeEnabled ??
          (Constants?.manifest as any)?.android?.edgeToEdgeEnabled ??
          false;

        const force = FORCE_LIGHT_SYSTEM_UI || FORCE_NAVIGATION_BAR_WHITE;

        if (force) {
          await navigationBar.setPositionAsync('relative');
          NavigationBarSetBackgroundColor(navigationBar, Colors.light.background);
        } else if (!edgeToEdgeEnabled && !runtimeEdgeToEdge) {
          await navigationBar.setPositionAsync('relative');
          navigationBar.setBackgroundColorAsync(Colors.light.background);
          setTimeout(() => navigationBar.setBackgroundColorAsync(Colors.light.background), 300);
          setTimeout(() => navigationBar.setBackgroundColorAsync(Colors.light.background), 1000);
        } else if (runtimeEdgeToEdge) {
          try {
            navigationBar.setStyle?.('light');
            setTimeout(() => navigationBar.setStyle?.('light'), 300);
            setTimeout(() => navigationBar.setStyle?.('light'), 1000);
          } catch {}
        }

        navigationBar.setButtonStyleAsync('dark');
        if (FORCE_LIGHT_SYSTEM_UI || FORCE_NAVIGATION_BAR_WHITE) {
          setTimeout(() => NavigationBarSetBackgroundColor(navigationBar, Colors.light.background), 500);
          setTimeout(() => navigationBar.setButtonStyleAsync('dark'), 600);
        }
        setTimeout(() => navigationBar.setButtonStyleAsync('dark'), 400);
      } catch {
        // ignore errors; this only runs when navigation bar is available
      }
    };

    const handler = (next: string) => {
      if (next === 'active') applyColors();
    };

    const subscription = AppState.addEventListener('change', handler);
    return () => subscription.remove();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      {/* set status bar background to white and dark icons */}
      <StatusBar style="dark" backgroundColor={Colors.light.background} />
      {/* Configure navigation bar for Android (applied via useEffect above) */}
    </ThemeProvider>
  );
}
