/**
 * Firebase Configuration and Initialization
 * 
 * This module initializes Firebase Authentication with Google provider.
 * Configuration values are loaded from environment variables for security.
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  connectAuthEmulator 
} from 'firebase/auth';

/**
 * Validate that all required Firebase configuration is present
 * @throws {Error} If required env vars are missing
 */
const validateFirebaseConfig = () => {
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
  ];

  const missingKeys = requiredKeys.filter(key => !import.meta.env[key]);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missingKeys.join(', ')}. ` +
      `Please set these environment variables in your .env file.`
    );
  }
};

/**
 * Get Firebase configuration from environment variables
 * @returns {Object} Firebase configuration object
 */
const getFirebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

/**
 * Initialize Firebase and return auth instance
 * Validates configuration and sets up session persistence
 * 
 * @returns {import('firebase/auth').Auth} Firebase Auth instance
 * @throws {Error} If Firebase config is invalid or initialization fails
 */
export const initializeFirebase = () => {
  try {
    validateFirebaseConfig();
    
    const firebaseConfig = getFirebaseConfig();
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    
    // Get Auth instance
    const auth = getAuth(app);
    
    // Enable session persistence (keeps user logged in across page refreshes)
    setPersistence(auth, browserLocalPersistence).catch(error => {
      console.warn('Failed to enable session persistence:', error);
      // This is non-critical, app will still work
    });

    // Connect to emulator if in development (optional)
    // Uncomment to use Firebase Auth Emulator for local testing
    // if (import.meta.env.DEV && !auth.emulatorConfig) {
    //   connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    // }

    return auth;
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    throw error;
  }
};

/**
 * Get the current Firebase Auth instance
 * Must be called after initializeFirebase()
 * 
 * @returns {import('firebase/auth').Auth} Firebase Auth instance
 */
export const getFirebaseAuth = () => {
  try {
    // This will use the already initialized app from initializeApp
    return getAuth();
  } catch (error) {
    console.error('Failed to get Firebase Auth instance:', error.message);
    throw new Error('Firebase has not been initialized. Call initializeFirebase() first.');
  }
};

/**
 * Get the current Firebase App instance
 * Useful for accessing other Firebase services
 * 
 * @returns {import('firebase/app').FirebaseApp} Firebase App instance
 */
export const getFirebaseApp = () => {
  const app = initializeApp.getApp?.();
  if (!app) {
    throw new Error('Firebase has not been initialized');
  }
  return app;
};

export default {
  initializeFirebase,
  getFirebaseAuth,
  getFirebaseApp,
};
