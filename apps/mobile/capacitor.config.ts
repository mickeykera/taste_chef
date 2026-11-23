import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.tastechef.mobile',
  appName: 'TasteChef',
  webDir: 'dist',
  backgroundColor: '#F6F0E4',
  android: {
    allowMixedContent: false,
    // Android 15 draws edge-to-edge by default. Let Capacitor keep the WebView
    // clear of the system bars so the CSS safe-area padding stays accurate.
    adjustMarginsForEdgeToEdge: 'auto',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
