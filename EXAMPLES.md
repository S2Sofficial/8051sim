/**
 * Common Usage Examples for Google Authentication
 * 
 * Copy and paste these examples into your components
 */

// ============================================================================
// 1. BASIC: Getting Current User
// ============================================================================

import { useAuth } from '@/context/AuthContext';

export function UserDisplay() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (isAuthenticated) {
    return (
      <div>
        <img src={user.photoURL} alt="User" />
        <p>Welcome, {user.displayName}</p>
        <p>{user.email}</p>
      </div>
    );
  }

  return <p>Please sign in</p>;
}

// ============================================================================
// 2. BUTTON: Manual Sign In / Sign Out
// ============================================================================

import { useAuth } from '@/context/AuthContext';

export function AuthButtons() {
  const { isAuthenticated, signInWithGoogle, logout, loading } = useAuth();

  if (loading) return <button disabled>Loading...</button>;

  if (isAuthenticated) {
    return (
      <button onClick={logout} disabled={loading}>
        Sign Out
      </button>
    );
  }

  return (
    <button onClick={signInWithGoogle} disabled={loading}>
      Sign In with Google
    </button>
  );
}

// ============================================================================
// 3. CONDITIONAL: Show Content Only When Authenticated
// ============================================================================

import { useAuth } from '@/context/AuthContext';

export function Dashboard() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please sign in to see your dashboard</div>;
  }

  return <div>Your Dashboard Content</div>;
}

// ============================================================================
// 4. GUARD: Protect Feature Component
// ============================================================================

import { ProtectedFeature } from '@/components/ProtectedFeature';

export function App() {
  return (
    <div>
      <ProtectedFeature feature="Advanced Simulator">
        <AdvancedSimulator />
      </ProtectedFeature>
    </div>
  );
}

// ============================================================================
// 5. ERROR HANDLING: Display Auth Errors
// ============================================================================

import { useAuth } from '@/context/AuthContext';

export function SignInWithError() {
  const { error, signInWithGoogle, loading } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleSignIn} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && (
        <div style={{ color: 'red' }}>
          Error: {error.message}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 6. FORM: Fetch User Data in Form
// ============================================================================

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function UserForm() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  );
}

// ============================================================================
// 7. API: Use User UID in API Calls
// ============================================================================

import { useAuth } from '@/context/AuthContext';

export function SaveData() {
  const { user } = useAuth();

  const handleSave = async (data) => {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.uid,     // Use user.uid as unique identifier
        data: data,
        timestamp: new Date().toISOString()
      })
    });

    return response.json();
  };

  return (
    <button onClick={() => handleSave({ test: 'data' })}>
      Save Data
    </button>
  );
}

// ============================================================================
// 8. GUARD: Show Different UI Based on Auth
// ============================================================================

import { AuthGuard, PublicGuard } from '@/components/ProtectedFeature';

export function HomePage() {
  return (
    <div>
      <AuthGuard fallback={<LandingPage />}>
        <Dashboard />
      </AuthGuard>

      <PublicGuard fallback={<UserProfile />}>
        <SignInPrompt />
      </PublicGuard>
    </div>
  );
}

// ============================================================================
// 9. ASYNC: Wait for Auth Before Rendering
// ============================================================================

import { useAuth } from '@/context/AuthContext';

export function WaitForAuth({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return children;
}

// Usage:
// <WaitForAuth>
//   <YourComponent />
// </WaitForAuth>

// ============================================================================
// 10. REDIRECT: Redirect to Sign In if Not Authenticated
// ============================================================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function ProtectedPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected Content</div>;
}

// ============================================================================
// 11. STORAGE: Save User Preferences by UID
// ============================================================================

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export function UserPreferences() {
  const { user } = useAuth();
  const [theme, setTheme] = useState('light');

  // Load preferences for this user
  useEffect(() => {
    if (!user) return;

    const saved = localStorage.getItem(`user_prefs_${user.uid}`);
    if (saved) {
      setTheme(JSON.parse(saved).theme);
    }
  }, [user]);

  // Save preferences for this user
  const saveTheme = (newTheme) => {
    setTheme(newTheme);
    if (user) {
      localStorage.setItem(
        `user_prefs_${user.uid}`,
        JSON.stringify({ theme: newTheme })
      );
    }
  };

  return (
    <div>
      <button onClick={() => saveTheme('light')}>Light</button>
      <button onClick={() => saveTheme('dark')}>Dark</button>
      <p>Current: {theme}</p>
    </div>
  );
}

// ============================================================================
// 12. CLEANUP: Remove Listener (Optional)
// ============================================================================

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function AuthListener() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // This runs when auth state changes
    if (isAuthenticated) {
      console.log('User logged in:', user.email);
      // Do something after login
    } else {
      console.log('User logged out');
      // Do something after logout
    }
  }, [isAuthenticated, user]);

  return <div>Logged in: {isAuthenticated ? 'Yes' : 'No'}</div>;
}

// ============================================================================
// 13. MULTIPLE: Multiple Auth States in One Component
// ============================================================================

import { useAuth } from '@/context/AuthContext';

export function ComplexComponent() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();

  if (loading) {
    return <div className="spinner">Authenticating...</div>;
  }

  if (error) {
    return <div className="error">Auth Error: {error.message}</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        <h2>Welcome {user.displayName}</h2>
        <img src={user.photoURL} alt="avatar" />
        <button onClick={logout}>Sign Out</button>
      </div>
    );
  }

  return <div>Not signed in</div>;
}

// ============================================================================
// 14. LAYOUT: Header with Auth Status
// ============================================================================

import { useAuth } from '@/context/AuthContext';
import { AuthUI } from '@/components/AuthUI';

export function Header() {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between' }}>
      <h1>My App</h1>
      <AuthUI />
    </header>
  );
}

// ============================================================================
// 15. CONTEXT: Use Multiple Auth Values
// ============================================================================

import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
  const auth = useAuth();

  return (
    <div>
      <div>Authenticated: {auth.isAuthenticated ? 'Yes' : 'No'}</div>
      <div>Loading: {auth.loading ? 'Yes' : 'No'}</div>
      <div>User: {auth.user?.displayName || 'None'}</div>
      <div>Error: {auth.error?.message || 'None'}</div>
    </div>
  );
}

// ============================================================================
// 16. DYNAMIC: Enable Features Based on Auth
// ============================================================================

import { useAuth } from '@/context/AuthContext';

export function FeatureFlags() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <h2>Features</h2>
      <div>
        <input type="checkbox" disabled={!isAuthenticated} />
        <label>Advanced Simulation (Auth Required)</label>
      </div>
      <div>
        <input type="checkbox" disabled />
        <label>Basic Simulator (Always Available)</label>
      </div>
    </div>
  );
}

// ============================================================================
// 17. NETWORK: Retry on Auth Failure
// ============================================================================

import { useAuth } from '@/context/AuthContext';

export function APICall() {
  const { user, signInWithGoogle } = useAuth();

  const fetchWithAuth = async (url) => {
    if (!user) {
      await signInWithGoogle();
    }

    const response = await fetch(url);

    if (response.status === 401) {
      // Token expired, refresh and retry
      await signInWithGoogle();
      return fetch(url);
    }

    return response;
  };

  return <button onClick={() => fetchWithAuth('/api/data')}>Fetch</button>;
}

// ============================================================================
// 18. VALIDATION: Require Auth for Submission
// ============================================================================

import { useAuth } from '@/context/AuthContext';

export function Form() {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please sign in first');
      return;
    }

    // Submit form
    console.log('Submitting:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={(e) => setFormData({ text: e.target.value })} />
      <button type="submit" disabled={!isAuthenticated}>
        Submit
      </button>
    </form>
  );
}

// ============================================================================
// 19. ANALYTICS: Track Auth Events
// ============================================================================

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function AuthAnalytics() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Track successful login
      window.gtag?.('event', 'login', {
        method: 'Google',
        user_id: user.uid,
        email: user.email
      });
    }
  }, [isAuthenticated, user]);

  return <div>Analytics tracking enabled</div>;
}

// ============================================================================
// 20. CUSTOM GUARD: Create Reusable Auth Guards
// ============================================================================

import { useAuth } from '@/context/AuthContext';

// Higher-Order Component
export function withAuth(Component) {
  return function ProtectedComponent(props) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return <div>Please sign in</div>;

    return <Component {...props} />;
  };
}

// Usage:
// export default withAuth(MyComponent);

// ============================================================================
// Quick Copy-Paste Snippets
// ============================================================================

/*
// Get current user
const { user } = useAuth();

// Check if logged in
const { isAuthenticated } = useAuth();

// Wait for auth to load
const { loading } = useAuth();

// Handle errors
const { error } = useAuth();

// Sign in
const { signInWithGoogle } = useAuth();

// Sign out
const { logout } = useAuth();

// All at once
const { user, isAuthenticated, loading, error, signInWithGoogle, logout } = useAuth();

// Protect component
<ProtectedFeature><MyComponent /></ProtectedFeature>

// Conditional render
<AuthGuard><Authenticated /></AuthGuard>

// Show when not auth
<PublicGuard><NotAuthenticated /></PublicGuard>
*/

export default {};
