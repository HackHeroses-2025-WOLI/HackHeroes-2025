import { Colors } from '@/constants/theme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { isEdgeToEdge } from 'react-native-is-edge-to-edge';
import 'react-native-reanimated';

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

        if (!edgeToEdgeEnabled && !runtimeEdgeToEdge) {
          navigationBar.setBackgroundColorAsync(Colors.light.background);
        } else {
          // eslint-disable-next-line no-console
          console.info('Edge-to-edge enabled; not changing navigation bar background to avoid warnings.');
        }
        navigationBar.setButtonStyleAsync('dark');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(
          'expo-navigation-bar not installed. Run `expo install expo-navigation-bar` to control the system navigation bar on Android.'
        );
      }
    }
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
