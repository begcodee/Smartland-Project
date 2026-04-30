import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Native shells for Android / iOS (Capacitor).
 *
 * Build web assets: npm run build:capacitor
 * Sync into native projects: npx cap sync
 * Open Android Studio: npx cap open android
 *
 * Point the app at your machine API when testing on device/emulator:
 *   Windows CMD:  set VITE_API_URL=http://YOUR_LAN_IP:3001&& npm run build:capacitor && npx cap sync
 *   Android emulator → host machine API: http://10.0.2.2:3001
 *   Physical phone → same Wi‑Fi LAN IP as your PC, e.g. http://192.168.1.10:3001
 *
 * Backend CORS must allow Capacitor/WebView origins (see smartland backend cors config).
 */
const config: CapacitorConfig = {
  appId: 'gh.smartland.prototype',
  appName: 'SmartLand Registry',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
