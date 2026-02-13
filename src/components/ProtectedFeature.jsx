/**
 * Protected Features Component
 * 
 * Wrapper component that restricts access to features based on authentication status.
 * Can be used to guard any component or feature that requires authentication.
 * 
 * Usage:
 *   <ProtectedFeature requiredFeature="advanced-simulation">
 *     <AdvancedSimulator />
 *   </ProtectedFeature>
 */

import React from 'react';
import { Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ProtectedFeature.css';

/**
 * Protected Feature Component
 * 
 * Shows fallback UI if user is not authenticated, otherwise renders children.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to show when authenticated
 * @param {string} [props.feature] - Feature name for display purposes
 * @param {boolean} [props.showLock] - Show lock icon in fallback (default: true)
 * @param {React.ReactNode} [props.fallback] - Custom fallback UI
 * @returns {React.ReactElement} Component content or fallback
 */
export const ProtectedFeature = ({ 
  children, 
  feature = 'This feature',
  showLock = true,
  fallback = null 
}) => {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while loading to avoid layout shift
  if (loading) {
    return null;
  }

  // User is authenticated - show the feature
  if (isAuthenticated) {
    return children;
  }

  // Render custom fallback if provided
  if (fallback) {
    return fallback;
  }

  // Default fallback UI
  return (
    <div className="protected-feature-fallback">
      {showLock && <Lock className="protected-feature-icon" size={32} />}
      <h3 className="protected-feature-title">Authentication Required</h3>
      <p className="protected-feature-message">
        {feature} requires you to be signed in. Please sign in with your Google account to access this feature.
      </p>
      <div className="protected-feature-hint">
        <LogIn size={16} />
        <span>Use the sign-in button above to get started</span>
      </div>
    </div>
  );
};

/**
 * Conditional Render Component
 * 
 * Useful for conditionally showing/hiding smaller UI elements based on auth status.
 * More lightweight than ProtectedFeature for simple cases.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to show when authenticated
 * @param {React.ReactNode} [props.fallback] - Content to show when not authenticated
 * @returns {React.ReactElement} Appropriate content based on auth status
 */
export const AuthGuard = ({ children, fallback = null }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return isAuthenticated ? children : fallback;
};

/**
 * Inverse Auth Guard Component
 * 
 * Shows content only when user is NOT authenticated.
 * Useful for showing "sign in" prompts or landing page content.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to show when not authenticated
 * @param {React.ReactNode} [props.fallback] - Content to show when authenticated
 * @returns {React.ReactElement} Appropriate content based on auth status
 */
export const PublicGuard = ({ children, fallback = null }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return !isAuthenticated ? children : fallback;
};

export default ProtectedFeature;
