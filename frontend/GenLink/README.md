# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. Add WebView dependency (if you'd like to use the native WebView on mobile):

   ```bash
   expo install react-native-webview
   # or with npm/yarn if you prefer: npm install react-native-webview
   ```

   If you encounter bundling errors after installing, clear the Metro cache and restart the dev server:

   ```bash
   npx expo start -c
   ```

   5. Optionally install `expo-navigation-bar` if you want to style Android's bottom navigation bar (recommended):

      ```bash
      expo install expo-navigation-bar
      ```

   If you truly want to force white system bars regardless of the device theme or
   edge-to-edge settings, set the toggles in `constants/config.ts`:

   ```ts
   // constants/config.ts
   export const FORCE_LIGHT_SYSTEM_UI = true;
   export const FORCE_NAVIGATION_BAR_WHITE = true;
   ```

   This will attempt to force status and navigation bars to white on Android. Note
   that some OEMs may still override this; you might need to re-open the app after
   changing the config.

   Note: On some Android devices "edge-to-edge" is enabled (often set in `app.json` under `android.edgeToEdgeEnabled`). When edge-to-edge is enabled the OS may overlay the navigation bar and `expo-navigation-bar.setBackgroundColorAsync` will not work — it logs a warning. If you want to force the navigation bar background you can disable edge-to-edge in `app.json` (not recommended for all apps):

   ```jsonc
   // app.json
   {
      "expo": {
         "android": {
            "edgeToEdgeEnabled": false
         }
      }
   }
   ```

   Alternatively, keep edge-to-edge enabled (recommended) and the app will use white status bar with dark icons while leaving the system nav behavior unchanged.

4. Open the 'Pomoc' tab in the app to view the content from the central BASE_URL.
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
