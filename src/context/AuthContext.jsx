/**
 * Authentication Context
 * 
 * Provides authentication state and user information to the entire application.
 * Handles user persistence, loading states, and authentication errors.
 * 
 * Usage:
 *   const { user, loading, error, logout } = useAuth();
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getFirebaseAuth } from '../config/firebase';

/**
 * Context object for authentication
 * @type {React.Context<{
 *   user: import('firebase/auth').User | null,
 *   loading: boolean,
 *   error: Error | null,
 *   signInWithGoogle: () => Promise<void>,
 *   logout: () => Promise<void>,
 *   isAuthenticated: boolean
 * }>}
 */
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * 
 * Wraps the application and manages authentication state.
 * Sets up listener for auth state changes and handles persistence.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auth, setAuth] = useState(null);

  // Initialize Firebase auth and set up listener
  useEffect(() => {
    let unsubscribe;
    let isComponentMounted = true;

    try {
      const authInstance = getFirebaseAuth();
      setAuth(authInstance);

      // Listen for auth state changes (handles persistence automatically)
      unsubscribe = onAuthStateChanged(
        authInstance,
        (currentUser) => {
          if (isComponentMounted) {
            setUser(currentUser);
            setLoading(false);
            setError(null);
          }
        },
        (err) => {
          if (isComponentMounted) {
            console.error('Auth state change error:', err);
            setError(err);
            setLoading(false);
          }
        }
      );
    } catch (err) {
      if (isComponentMounted) {
        console.error('Failed to initialize auth:', err);
        setError(err);
        setLoading(false);
      }
    }

    // Cleanup
    return () => {
      isComponentMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  /**
   * Sign in with Google using popup strategy
   * @returns {Promise<void>}
   */
  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      setError(new Error('Auth not initialized'));
      return;
    }

    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      
      // Configure Google provider
      // Restrict to specific hosted domain if needed (uncomment):
      // provider.setCustomParameters({
      //   hd: 'yourdomain.com',
      //   prompt: 'select_account'
      // });

      // Enable Google One Tap if configured
      if (import.meta.env.VITE_ENABLE_ONE_TAP === 'true') {
        provider.addScopes([
          'profile',
          'email',
        ]);
      }

      // Use popup strategy (default)
      await signInWithPopup(auth, provider);
      // User state will update automatically via onAuthStateChanged listener
    } catch (err) {
      // Handle user cancellation gracefully
      if (err.code === 'auth/popup-closed-by-user') {
        console.log('Sign-in popup closed by user');
        return;
      }
      if (err.code === 'auth/cancelled-popup-request') {
        console.log('Multiple popups detected, using the previous popup');
        return;
      }
      console.error('Sign-in error:', err);
      setError(err);
      throw err;
    }
  }, [auth]);

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    if (!auth) {
      setError(new Error('Auth not initialized'));
      return;
    }

    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      // User state will update automatically via onAuthStateChanged listener
    } catch (err) {
      console.error('Logout error:', err);
      setError(err);
      throw err;
    }
  }, [auth]);

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 * 
 * @returns {Object} Auth context value with user, loading, error, signInWithGoogle, logout
 * @throws {Error} If used outside of AuthProvider
 * 
 * @example
 * const { user, loading, error, signInWithGoogle, logout, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
