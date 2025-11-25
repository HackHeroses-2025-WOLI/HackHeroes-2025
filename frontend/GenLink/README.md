# HackHeroes 2025 - GenLink Mobile App
React Native/Expo mobile application providing native mobile access to the GenLink volunteer platform connecting seniors with digital assistance.

## 📱 Overview
This mobile application serves as a native wrapper around the GenLink web platform, providing seniors with easy access to request digital assistance through an intuitive mobile interface. The app leverages WebView technology to deliver the full web experience within a native mobile container.

## 🚀 Features
✅ **Cross-Platform Support**: iOS, Android, and Web compatibility  
✅ **Expo Router**: File-based navigation with typed routes  
✅ **WebView Integration**: Seamless access to web-based forms and content  
✅ **Native UI Components**: Platform-specific styling and interactions  
✅ **Dark/Light Theme**: Automatic theme adaptation  
✅ **Tab Navigation**: Intuitive bottom tab navigation  
✅ **Splash Screen**: Custom branded loading experience  
✅ **Haptic Feedback**: Enhanced user interaction feedback  
✅ **Offline Handling**: Graceful network error management  

## 📁 Project Structure
```
GenLink/
├── app/
│   ├── (tabs)/                     # Tab-based navigation group
│   │   ├── _layout.tsx             # Tab layout configuration
│   │   ├── index.tsx               # Home tab (Help request form)
│   │   ├── explore.tsx             # Explore tab (App features)
│   │   └── pomoc.tsx               # Help tab (Alternative help access)
│   ├── _layout.tsx                 # Root layout configuration
│   ├── modal.tsx                   # Modal screen component
├── components/
│   ├── ui/                         # Reusable UI components
│   │   ├── collapsible.tsx         # Collapsible content sections
│   │   ├── icon-symbol.tsx         # Platform-specific icons
│   │   └── icon-symbol.ios.tsx     # iOS-specific icon variants
│   ├── app-webview.tsx             # Cross-platform WebView wrapper
│   ├── app-webview.native.tsx      # Native WebView implementation
│   ├── app-webview.web.tsx         # Web iframe implementation
│   ├── external-link.tsx           # External link handler
│   ├── haptic-tab.tsx              # Tab with haptic feedback
│   ├── hello-wave.tsx              # Animated greeting component
│   ├── parallax-scroll-view.tsx    # Parallax scroll container
│   ├── themed-text.tsx             # Theme-aware text component
│   └── themed-view.tsx             # Theme-aware view component
├── constants/
│   ├── config.ts                   # App configuration settings
│   └── theme.ts                    # Theme and styling constants
├── hooks/
│   ├── use-color-scheme.ts         # Color scheme detection
│   ├── use-color-scheme.web.ts     # Web-specific color scheme
│   └── use-theme-color.ts          # Theme color management
├── assets/
│   ├── animations/                 # Lottie animation files
│   └── images/                     # Static images and icons
├── scripts/
│   └── reset-project.js            # Project reset utility
├── app.json                        # Expo configuration
├── eas.json                        # Expo Application Services config
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
└── eslint.config.js               # ESLint configuration
```

## 🔧 Setup

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g @expo/cli`
- For iOS development: Xcode and iOS Simulator
- For Android development: Android Studio and Android Emulator

### 1. Navigate to the project directory
```bash
cd frontend/GenLink
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment
Edit `constants/config.ts` to point to your backend:
```typescript
export const BASE_URL = 'https://your-backend-url.com/appviews';
```

### 4. Start development server
```bash
# Start Expo development server
npm start

# Platform-specific commands
npm run android    # Start on Android
npm run ios        # Start on iOS  
npm run web        # Start on web browser
```

### 5. Build for production
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure and build
eas build --platform all
```

## 📱 Application Screens

### Tab Navigation Structure
- **🏠 Home Tab** (`/`) - Direct access to help request form via WebView
- **🔍 Explore Tab** (`/explore`) - App features overview and development info  
- **❓ Help Tab** (`/pomoc`) - Alternative help access with navigation header

### Screen Details

#### Home Screen (`index.tsx`)
- **Purpose**: Primary entry point for seniors requesting help
- **Implementation**: WebView loading `${BASE_URL}/pomoc`
- **Features**: Full-screen help form experience

#### Explore Screen (`explore.tsx`)
- **Purpose**: App information and feature exploration
- **Implementation**: Native scrollable interface with collapsible sections
- **Features**: 
  - File-based routing explanation
  - Platform support information
  - Component showcase (animations, theming, images)
  - External links to documentation

#### Help Screen (`pomoc.tsx`)
- **Purpose**: Alternative help access with navigation
- **Implementation**: WebView with custom header
- **Features**: Back navigation and branded header

## 🎨 UI Components & Theming

### Core Components

#### `<AppWebView>`
Cross-platform WebView component with platform-specific optimizations:
- **Mobile**: Uses `react-native-webview` with loading states
- **Web**: Uses iframe with security sandboxing
- **Features**: Loading indicators, error handling, responsive design

#### `<ThemedText>` & `<ThemedView>`
Theme-aware components that automatically adapt to light/dark modes:
```tsx
<ThemedText type="title">Themed Title</ThemedText>
<ThemedView style={styles.container}>
  // Content adapts to current theme
</ThemedView>
```

#### `<HapticTab>`
Tab button with haptic feedback for enhanced mobile experience:
```tsx
<HapticTab 
  name="index" 
  title="Pomoc"
  icon={({ color, focused }) => <TabBarIcon />}
/>
```

### Typography System
- **Primary Font**: System default for optimal readability
- **Rounded Font**: Used for headings and key UI elements
- **Monospace Font**: Code examples and technical content

### Theme Configuration
```typescript
// Automatic theme detection
const colorScheme = useColorScheme();

// Theme colors
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',
    // ... more colors
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    // ... more colors
  },
};
```

## 🔌 Integration with Backend

### WebView Integration
The app primarily communicates with the backend through WebView-loaded pages:

```typescript
// Configuration in constants/config.ts
export const BASE_URL = 'https://hackheroes-2025-frontend.onrender.com/appviews';

// Usage in components
const url = `${BASE_URL}/pomoc`;
return <AppWebView uri={url} />;
```

### Supported Pages
- `/pomoc` - Help request form for seniors
- `/potwierdzenie` - Confirmation page after form submission
- Any other `/appviews/*` routes from the web platform

## 📱 Platform-Specific Features

### iOS
- **Adaptive Icons**: Custom adaptive icon with background/foreground
- **Tablet Support**: Optimized for iPad usage
- **SF Symbols**: Native icon integration via `expo-symbols`
- **Haptic Feedback**: iOS-specific haptic patterns

### Android
- **Adaptive Icons**: Material Design adaptive icons
- **Edge-to-Edge**: Configurable edge-to-edge display
- **Navigation Bar**: Custom navigation bar theming
- **Predictive Back**: Modern Android gesture support

### Web
- **Progressive Web App**: Installable web app experience
- **Static Output**: Optimized static site generation
- **Iframe Fallback**: Secure iframe implementation for WebView content
- **Favicon**: Custom branded favicon

## 🚀 Development

### Available Scripts
```bash
# Development
npm start                 # Start Expo development server
npm run android          # Launch on Android emulator/device
npm run ios              # Launch on iOS simulator/device  
npm run web              # Launch in web browser
npm run lint             # Run ESLint code quality checks

# Utilities
npm run reset-project    # Reset to clean project state
```

### Development Workflow
1. **Start Development Server**: `npm start`
2. **Choose Platform**: Press `a` for Android, `i` for iOS, `w` for web
3. **Live Reload**: Changes automatically reflect in the app
4. **Debug**: Use React DevTools and platform-specific debugging tools

### Code Quality
- **TypeScript**: Full type safety with strict configuration
- **ESLint**: Code quality and consistency enforcement  
- **Expo Lint**: Expo-specific linting rules
- **Prettier Integration**: Automatic code formatting

## 🔧 Configuration

### App Configuration (`app.json`)
```json
{
  "expo": {
    "name": "GenLink",
    "slug": "GenLink", 
    "version": "1.0.0",
    "scheme": "genlink",
    "newArchEnabled": true,
    // Platform-specific settings...
  }
}
```

### Key Configuration Options
- **Custom URL Scheme**: `genlink://` for deep linking
- **New Architecture**: Enabled for better performance
- **Adaptive Icons**: Platform-specific icon configurations
- **Splash Screen**: Custom branded loading screen
- **TypedRoutes**: Type-safe navigation with Expo Router

## 🌐 Backend Configuration

### Environment Setup
To connect to your own backend instance:

1. **Update Base URL** in `constants/config.ts`:
```typescript
export const BASE_URL = 'https://your-backend-domain.com/appviews';
```

2. **Ensure CORS Configuration** on your backend to allow mobile WebView requests

3. **Test WebView Loading** to ensure all routes are accessible

### Backend Requirements
- Must serve `/appviews/pomoc` route for help form
- Must serve `/appviews/potwierdzenie` route for confirmation
- Should handle mobile WebView user agents appropriately
- CORS headers must allow WebView origins

## 📦 Dependencies

### Core Dependencies
- **Expo**: ~54.0.25 - React Native platform
- **React**: 19.1.0 - UI framework
- **React Native**: 0.81.5 - Mobile framework
- **Expo Router**: ~6.0.15 - File-based navigation

### Key Packages
- **react-native-webview**: WebView implementation
- **react-native-reanimated**: Smooth animations
- **expo-haptics**: Haptic feedback
- **expo-symbols**: iOS SF Symbols support
- **lottie-react-native**: Vector animations

### Development Dependencies  
- **TypeScript**: ~5.9.2 - Type safety
- **ESLint**: ^9.25.0 - Code quality
- **@types/react**: Type definitions

## 🤝 Integration Notes

### With Web Platform
This mobile app serves as a native container for the web-based GenLink platform:
- **WebView Integration**: Loads web pages within native app shell
- **Shared Backend**: Uses the same API endpoints as the web version
- **Consistent Experience**: Maintains UI/UX consistency across platforms

### Development Coordination
When developing both web and mobile simultaneously:
1. Ensure backend serves `/appviews/*` routes optimized for mobile
2. Test WebView rendering across different screen sizes
3. Verify touch interactions work properly in WebView
4. Coordinate authentication flows between native and web contexts

---

**HackHeroes 2025 Project** - Native mobile access to GenLink volunteer platform, connecting seniors with digital assistance through intuitive mobile interfaces.
