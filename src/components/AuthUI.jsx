/**
 * Authentication UI Component
 * 
 * Provides user interface for authentication:
 * - Sign in button with Google
 * - User profile display
 * - Logout button
 * - Loading and error states
 * 
 * Production-ready with proper error handling and accessibility.
 */

import React, { useState } from 'react';
import { LogOut, LogIn, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthUI.css';

/**
 * Google Sign-In Button Component
 */
const GoogleSignInButton = ({ onSignIn, loading, error }) => {
  const handleClick = async () => {
    try {
      await onSignIn();
    } catch (err) {
      // Error already handled in context
      console.error('Sign-in failed:', err);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="auth-sign-in-btn"
      aria-label="Sign in with Google"
      aria-busy={loading}
    >
      {loading ? (
        <>
          <Loader className="auth-icon auth-icon-spin" size={18} />
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <svg className="auth-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Sign in with Google</span>
        </>
      )}
    </button>
  );
};

/**
 * User Profile Display Component
 */
const UserProfile = ({ user, onLogout, loading, error }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await onLogout();
      setShowMenu(false);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="auth-user-profile">
      <div className="auth-profile-container">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User avatar'}
            className="auth-avatar"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="auth-user-info">
          <p className="auth-user-name">{user.displayName || 'User'}</p>
          <p className="auth-user-email">{user.email}</p>
        </div>
        <button
          className="auth-menu-toggle"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Open user menu"
          aria-expanded={showMenu}
          aria-haspopup="true"
        >
          <span className="auth-menu-dots">⋮</span>
        </button>
      </div>

      {showMenu && (
        <div className="auth-dropdown-menu">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="auth-logout-btn"
            aria-label="Sign out"
          >
            {loading ? (
              <>
                <Loader className="auth-icon auth-icon-spin" size={16} />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="auth-icon" size={16} />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="auth-error-message" role="alert">
          <AlertCircle className="auth-icon" size={16} />
          <span>{error.message || 'An error occurred'}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Main Authentication UI Component
 * 
 * Shows sign-in button when not authenticated, user profile when authenticated.
 * Handles loading and error states.
 * 
 * @returns {React.ReactElement} Auth UI component
 */
export const AuthUI = () => {
  const { user, loading, error, signInWithGoogle, logout } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading" role="status" aria-label="Loading authentication">
        <Loader className="auth-icon auth-icon-spin" size={20} />
      </div>
    );
  }

  if (user) {
    return (
      <UserProfile
        user={user}
        onLogout={logout}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <div className="auth-signin-container">
      {error && (
        <div className="auth-error-message" role="alert">
          <AlertCircle className="auth-icon" size={18} />
          <span>
            {error.message || 'Failed to sign in. Please try again.'}
          </span>
        </div>
      )}
      <GoogleSignInButton
        onSignIn={signInWithGoogle}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default AuthUI;
