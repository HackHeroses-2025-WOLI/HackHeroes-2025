import { FORCE_LIGHT_SYSTEM_UI, FORCE_NAVIGATION_BAR_WHITE } from '@/constants/config';
import { Colors } from '@/constants/theme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, Platform, StatusBar as RNStatusBar } from 'react-native';
import { isEdgeToEdge } from 'react-native-is-edge-to-edge';
import 'react-native-reanimated';

// Helper so we can retry setting the background color (wrapper around module API)
function NavigationBarSetBackgroundColor(navigationBar: any, color: string) {
  try {
    navigationBar.setBackgroundColorAsync(color);
  } catch (e) {
    try {
      // Some older versions might export it differently
      navigationBar.NavigationBar?.setBackgroundColorAsync?.(color);
    } catch {}
  }
}

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const navigationBar = require('expo-navigation-bar');
        // Make the top/status bar background white with dark icons
        // don't try to set navigation bar background if edge-to-edge is enabled
        // because many OEMs will ignore/set overlay and log a warning.
        const edgeToEdgeEnabled =
          (Constants?.expoConfig as any)?.android?.edgeToEdgeEnabled ??
          (Constants?.manifest as any)?.android?.edgeToEdgeEnabled ??
          false;

        const runtimeEdgeToEdge = isEdgeToEdge();

        const force = FORCE_LIGHT_SYSTEM_UI || FORCE_NAVIGATION_BAR_WHITE;

        if (force) {
          // If the user wants to force a white UI, attempt it regardless of edge-to-edge.
          // Log debug values to help troubleshoot specific devices.
          // eslint-disable-next-line no-console
          console.info('FORCE_LIGHT_SYSTEM_UI or FORCE_NAVIGATION_BAR_WHITE is true', {
            force,
            edgeToEdgeEnabled,
            runtimeEdgeToEdge,
          });
          navigationBar.setPositionAsync('relative');
          NavigationBarSetBackgroundColor(navigationBar, Colors.light.background);
        } else if (!edgeToEdgeEnabled && !runtimeEdgeToEdge) {
          // Make navigation bar inline with the app content to ensure background is applied
          navigationBar.setPositionAsync('relative');
          navigationBar.setBackgroundColorAsync(Colors.light.background);
        } else if (runtimeEdgeToEdge) {
          // If edge-to-edge is active, use setStyle to request a light nav bar that matches
          // the app background (note: device OEMs may still override this behavior).
          try {
            navigationBar.setStyle?.('light');
          } catch {}
        } else {
          // eslint-disable-next-line no-console
          console.info('Edge-to-edge enabled; not changing navigation bar background to avoid warnings.');
        }
        navigationBar.setButtonStyleAsync('dark');
        // If forcing the UI color, also ensure buttons are dark (black) for white bar
        if (FORCE_LIGHT_SYSTEM_UI || FORCE_NAVIGATION_BAR_WHITE) {
          navigationBar.setButtonStyleAsync('dark');
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(
          'expo-navigation-bar not installed. Run `expo install expo-navigation-bar` to control the system navigation bar on Android.'
        );
      }
    }

    // ensure status/navigation bar colors restored when app comes back from background
    const applyColors = () => {
      try {
        RNStatusBar.setBackgroundColor(Colors.light.background, true);
        RNStatusBar.setBarStyle('dark-content', true);

        // reapply nav bar colors via expo-navigation-bar
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const navigationBar = require('expo-navigation-bar');
        const runtimeEdgeToEdge = isEdgeToEdge();
        const edgeToEdgeEnabled =
          (Constants?.expoConfig as any)?.android?.edgeToEdgeEnabled ??
          (Constants?.manifest as any)?.android?.edgeToEdgeEnabled ??
          false;

          const force = FORCE_LIGHT_SYSTEM_UI || FORCE_NAVIGATION_BAR_WHITE;

          if (force) {
            // Re-apply regardless to override bad OEM resets
            navigationBar.setPositionAsync('relative');
            NavigationBarSetBackgroundColor(navigationBar, Colors.light.background);
          } else if (!edgeToEdgeEnabled && !runtimeEdgeToEdge) {
          // Make navigation bar inline with the app content to ensure background is applied
          navigationBar.setPositionAsync('relative');
          // sometimes OEMs reset the nav bar after resume; try multiple times with slight delays
          navigationBar.setBackgroundColorAsync(Colors.light.background);
          setTimeout(() => navigationBar.setBackgroundColorAsync(Colors.light.background), 300);
          setTimeout(() => navigationBar.setBackgroundColorAsync(Colors.light.background), 1000);
        } else if (runtimeEdgeToEdge) {
          // When resuming with edge-to-edge, try setStyle to make nav bar light
          try {
            navigationBar.setStyle?.('light');
            setTimeout(() => navigationBar.setStyle?.('light'), 300);
            setTimeout(() => navigationBar.setStyle?.('light'), 1000);
          } catch {}
        }

        navigationBar.setButtonStyleAsync('dark');
        if (FORCE_LIGHT_SYSTEM_UI || FORCE_NAVIGATION_BAR_WHITE) {
          // Try to ensure the navigation bar background and style are applied again
          setTimeout(() => NavigationBarSetBackgroundColor(navigationBar, Colors.light.background), 500);
          setTimeout(() => navigationBar.setButtonStyleAsync('dark'), 600);
        }
        // re-apply after small delay to ensure system / OEM overlays are overridden
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
