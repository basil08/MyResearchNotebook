import Constants from 'expo-constants';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
// Values are loaded from .env file via app.config.cjs

/**
 * Get Firebase config based on platform
 * - Mobile (iOS/Android): Uses Constants.expoConfig.extra (from app.config.cjs)
 * - Web: Uses import.meta.env (from Vite) or process.env (from build config)
 */
function getFirebaseConfig() {
  // For web platform, environment variables work differently
  if (Platform.OS === 'web') {
    // In Expo web, we need to access via process.env directly
    // These are injected at build time by Metro/Webpack
    return {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 
              process.env.FIREBASE_API_KEY || "",
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 
                  process.env.FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 
                 process.env.FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 
                     process.env.FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 
                         process.env.FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 
             process.env.FIREBASE_APP_ID || "",
    };
  }
  
  // For mobile (iOS/Android), use Constants.expoConfig.extra
  return {
    apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "",
    authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "",
    projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "",
    storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "",
    appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "",
  };
}

const firebaseConfig = getFirebaseConfig();

// Debug: Log config to verify values are loaded (remove in production)
console.log('Firebase Config Loaded:', {
  platform: Platform.OS,
  apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing',
  appId: firebaseConfig.appId ? '✅ Set' : '❌ Missing',
});

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is incomplete!');
  console.error('Make sure your .env file has all required FIREBASE_* variables');
  if (Platform.OS === 'web') {
    console.error('For web, also check that environment variables are prefixed with EXPO_PUBLIC_');
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
// Firebase automatically handles persistence for React Native using AsyncStorage
const auth = getAuth(app);

export { app, auth };
