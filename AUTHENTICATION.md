# Google Authentication Implementation Guide

This document provides complete setup and usage instructions for the Google Authentication system implemented in this project using Firebase Authentication.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [File Structure](#file-structure)
4. [Setup Instructions](#setup-instructions)
5. [Authentication Flow](#authentication-flow)
6. [Session Persistence](#session-persistence)
7. [Protected Features](#protected-features)
8. [API Reference](#api-reference)
9. [Firebase Console Configuration](#firebase-console-configuration)
10. [Security Best Practices](#security-best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select an existing one
3. Enable Google Sign-In in **Authentication > Sign-in method**
4. Get your configuration from **Project Settings > Your apps**

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Fill in your Firebase credentials from the Firebase Console
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other variables
```

### 3. Restrict Authorized Domains

⚠️ **Critical Security Step**

1. Go to Firebase Console → Authentication → Settings
2. Under "Authorized domains", add your domain(s):
   - Production: `yourdomain.com`
   - Development: `localhost:5173` (for Vite)
3. **Remove** `localhost:*` and `127.0.0.1:*` from production releases

### 4. Use in Your App

The authentication system is now ready. Users will see a "Sign in with Google" button in the header.

```jsx
import { AuthUI } from './components/AuthUI';

// In your component
<AuthUI />  // Displays sign-in button or user profile
```

---

## Architecture Overview

### Component Hierarchy

```
App
├── AuthProvider
│   ├── Header
│   │   └── AuthUI
│   │       ├── GoogleSignInButton (unauthenticated)
│   │       └── UserProfile (authenticated)
│   ├── Main Content
│   └── Other Components
└── LandingPage
```

### State Management Flow

```
User Action
    ↓
AuthUI Component
    ↓
useAuth() Hook
    ↓
AuthContext (Auth State)
    ↓
Firebase SDK
    ↓
onAuthStateChanged Listener
    ↓
Context Updates
    ↓
Components Re-render
```

### Data Flow

1. **Initialization**: `main.jsx` calls `initializeFirebase()`
2. **Setup**: `AuthProvider` wraps application and sets up auth listener
3. **Auth Change**: User signs in/out, `onAuthStateChanged` fires
4. **State Update**: Context updates `user`, `isAuthenticated`, `loading`
5. **Persistence**: Firebase automatically persists session to `localStorage`
6. **UI Updates**: Components using `useAuth()` re-render with new state

---

## File Structure

```
src/
├── config/
│   └── firebase.js              # Firebase initialization & config
├── context/
│   └── AuthContext.jsx          # Auth state & provider
├── components/
│   ├── AuthUI.jsx               # Sign-in/Profile UI
│   ├── AuthUI.css               # Auth styling with CSS vars
│   ├── ProtectedFeature.jsx     # Auth guards & wrappers
│   └── ProtectedFeature.css     # Guard styling
├── main.jsx                     # App entry (calls initializeFirebase)
└── App.jsx                      # Main app (wrapped in AuthProvider)

.env.example                     # Environment template
.env.local                       # Local env (GITIGNORED)
```

---

## Setup Instructions

### Step 1: Firebase Project Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add Project**
3. Enter project name and click **Create Project**
4. Wait for project to be created

#### Enable Google Authentication
1. Navigate to **Authentication** (left sidebar)
2. Click **Get Started**
3. Click **Google** provider
4. Toggle **Enabled**
5. Select a project support email
6. Click **Save**

#### Get Configuration
1. Go to **Project Settings** (gear icon top-left)
2. Click **Your apps** section
3. If no app exists, click **Web** to create one
4. You'll see your Firebase config

```javascript
// Your config will look like:
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "myproject.firebaseapp.com",
  projectId: "myproject-12345",
  storageBucket: "myproject-12345.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

### Step 2: Local Development Setup

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Edit .env.local with your Firebase config
# (Use your credentials from Step 1)

# 3. Install dependencies (if not done)
npm install

# 4. Start dev server
npm run dev

# 5. Visit http://localhost:5173 and test sign-in
```

### Step 3: Configure Authorized Domains

**For Development (localhost):**
- Firebase Console → Authentication → Settings → Authorized domains
- Add: `localhost:5173`

**For Production:**
- Add your actual domain: `yourdomain.com`
- **Remove** `localhost:*` before deploying

### Step 4: Deploy

```bash
# Build
npm run build

# Deploy to your hosting
# (Vercel, Netlify, Firebase Hosting, etc.)
```

**After Deployment:**
1. Add your production domain to Authorized domains in Firebase Console
2. Remove any localhost entries
3. Test authentication on your live site

---

## Authentication Flow

### Sign-In Flow (User Perspective)

```
User clicks "Sign in with Google"
           ↓
Google login popup appears
           ↓
User enters credentials
           ↓
Google redirects back to app
           ↓
Firebase creates user session
           ↓
Session saved to localStorage
           ↓
AuthContext updates user state
           ↓
AuthUI shows user profile
           ↓
App unlocks protected features
```

### Sign-Out Flow

```
User clicks profile menu → Sign Out
           ↓
logout() in AuthContext called
           ↓
Firebase Auth signs out
           ↓
localStorage session cleared
           ↓
AuthContext updates user to null
           ↓
AuthUI shows sign-in button
           ↓
Protected features hidden
```

### Error Handling

Common errors and how they're handled:

| Error | Handling |
|-------|----------|
| User closes popup | Silently ignored, no error shown |
| Network error | Error displayed to user |
| Invalid config | Logged to console, auth unavailable |
| Firebase not initialized | Error caught, app still works |

---

## Session Persistence

### How It Works

1. **Login**: Firebase stores `idToken` in `localStorage`
2. **Page Refresh**: `onAuthStateChanged` reads token from storage
3. **Token Valid**: User stays logged in
4. **Token Expired**: Firebase refreshes automatically
5. **Logout**: Token removed from storage

### Configuration

Session persistence is **enabled by default** via `browserLocalPersistence` in `firebase.js`:

```javascript
setPersistence(auth, browserLocalPersistence)
```

This means:
- ✅ User stays logged in after page refresh
- ✅ User stays logged in after closing browser
- ✅ User stays logged in across tabs/windows
- ✅ Token auto-refreshes silently

### Disabling Persistence

To require re-login on page refresh, modify `firebase.js`:

```javascript
// Comment out:
// setPersistence(auth, browserLocalPersistence)
```

### Clearing Session Manually

Session is cleared when:
- User clicks logout
- Token expires and can't be refreshed
- User clears browser localStorage manually
- App is uninstalled (mobile PWA)

---

## Protected Features

### Using ProtectedFeature Wrapper

Wrap features that require authentication:

```jsx
import { ProtectedFeature } from './components/ProtectedFeature';

<ProtectedFeature feature="Advanced Simulation">
  <AdvancedSimulator />
</ProtectedFeature>
```

Shows lockscreen if not authenticated, otherwise renders component.

### Using AuthGuard for Conditional Content

Show content only when authenticated:

```jsx
import { AuthGuard, PublicGuard } from './components/ProtectedFeature';

// Show only for authenticated users
<AuthGuard>
  <SavedSimulations />
</AuthGuard>

// Show only for non-authenticated users
<PublicGuard>
  <LandingPage />
</PublicGuard>
```

### Using useAuth Hook

Access auth state directly:

```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (isAuthenticated) {
    return <div>Hello {user.displayName}</div>;
  }
  
  return <div>Please sign in</div>;
}
```

---

## API Reference

### `useAuth()` Hook

Returns authentication state and methods.

```javascript
const {
  user,                    // Firebase User object or null
  isAuthenticated,         // boolean
  loading,                 // boolean (true while checking auth state)
  error,                   // Error object or null
  signInWithGoogle,        // async function()
  logout                   // async function()
} = useAuth();
```

**Example: User Object**
```javascript
{
  uid: "user_id_123",
  email: "user@gmail.com",
  displayName: "John Doe",
  photoURL: "https://lh3.googleusercontent.com/...",
  metadata: {
    creationTime: "2024-02-13T10:30:00Z",
    lastSignInTime: "2024-02-13T12:45:00Z"
  }
}
```

### `AuthProvider` Component

Wraps your app to provide authentication context.

```jsx
<AuthProvider>
  <App />
</AuthProvider>
```

Setup in `main.jsx` - already done for you.

### `AuthUI` Component

Displays sign-in button or user profile.

```jsx
<AuthUI />

// Props: None (uses useAuth internally)
```

**Renders:**
- When not authenticated: "Sign in with Google" button
- When authenticated: User profile with logout menu
- While loading: Spinner

### `ProtectedFeature` Component

Restricts component access to authenticated users.

```jsx
<ProtectedFeature 
  feature="Advanced Simulation"
  showLock={true}
  fallback={<CustomLockScreen />}
>
  <AdvancedContent />
</ProtectedFeature>
```

**Props:**
- `children` (required): Content to show when authenticated
- `feature` (optional): Feature name for UI text
- `showLock` (optional): Show lock icon (default: true)
- `fallback` (optional): Custom UI when not authenticated

### `AuthGuard` Component

Conditionally render content based on auth state.

```jsx
<AuthGuard fallback={<SignInPrompt />}>
  <ProtectedContent />
</AuthGuard>
```

### `PublicGuard` Component

Opposite of `AuthGuard` - shows when NOT authenticated.

```jsx
<PublicGuard fallback={<AlreadySignedIn />}>
  <LandingPage />
</PublicGuard>
```

---

## Firebase Console Configuration

### Authorize Your Domain

**This step is CRITICAL for production.**

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**

#### For Development
- Add: `localhost:5173` (for Vite dev server)
- Add: `127.0.0.1:5173`

#### For Production
- Add your domain: `yourdomain.com`
- OR: `app.yourdomain.com`
- Do NOT add `localhost:*`

**Why This Matters:**
- Without authorized domains, Google OAuth will be blocked
- Users will see "Invalid OAuth Redirect" error
- Your app will appear to break for users
- Unauthorized domains are automatically blocked for security

### Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (for public use)
3. Fill in Application name, support email, etc.
4. Add your domain under Authorized domains
5. Click **Save and Continue**
6. Add scopes: `profile`, `email`

---

## Security Best Practices

### Environment Variables

✅ **DO:**
- Store Firebase config in `.env.local`
- Add `.env.local` to `.gitignore`
- Use `VITE_` prefix for frontend visibility
- Keep API key in environment variables

❌ **DON'T:**
- Commit `.env.local` to Git
- Hardcode Firebase config in source
- Expose API key in public repos (it's public anyway, use domain restriction)
- Store sensitive data in localStorage

### Firebase Console Security

✅ **DO:**
- Restrict authorized domains
- Enable Google provider only (no email/password)
- Review user list regularly
- Monitor sign-in activity
- Use strong project passwords

❌ **DON'T:**
- Leave `localhost:*` in production
- Enable anonymous auth
- Enable phone auth (if not needed)
- Use weak project security rules

### Session Security

✅ **DO:**
- Use HTTPS in production
- Let Firebase handle token refresh
- Use browserLocalPersistence (default)
- Clear localStorage on logout

❌ **DON'T:**
- Store tokens manually
- Disable session persistence
- Redirect to non-HTTPS
- Expose user token to third parties

### Client-Side Validation

⚠️ **Remember:** Anyone can access client-side code!

✅ **DO:**
- Use `AuthGuard` for UX (hide features)
- Check `isAuthenticated` before showing UI
- Validate on backend (if you have one)

❌ **DON'T:**
- Rely only on client-side auth checks
- Send sensitive data without backend validation
- Trust localStorage without verification

---

## Troubleshooting

### "Sign-in popup closed by user"

**Cause:** User closed the Google login popup

**Solution:** No action needed - this is normal. User will see the sign-in button again.

### "Unauthorized redirect_uri"

**Cause:** Your domain is not in Firebase's authorized domains list

**Solution:**
1. Go to Firebase Console
2. Authentication → Settings → Authorized domains
3. Add your current domain
4. Wait 5 minutes for changes to propagate
5. Try again

### "invalid configuration"

**Cause:** Environment variables not set correctly

**Solution:**
1. Check `.env.local` has all required variables
2. Verify values from Firebase Console
3. Restart dev server: `npm run dev`

**Required variables:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`

### User logs out immediately after login

**Cause:** Session persistence not working, usually due to:
- Subdomain mismatch in authorized domains
- HTTPS/HTTP mismatch
- localStorage cleared

**Solution:**
1. Check domain exactly matches (with/without `www`)
2. Ensure HTTPS in production
3. Check browser hasn't blocked localStorage
4. Clear browser cache and cookies

### Sign-in button not appearing

**Cause:** AuthProvider might not be wrapping app

**Solution:**
1. Check `main.jsx` has `<AuthProvider>`
2. Verify imports in `App.jsx`
3. Check browser console for errors
4. Restart dev server

### "Firebase has not been initialized"

**Cause:** `initializeFirebase()` wasn't called or failed

**Solution:**
1. Check `main.jsx` calls `initializeFirebase()`
2. Check `.env.local` has Firebase config
3. Check browser console for error message
4. Look at detailed error in console

### Dark mode styling issues

**Cause:** CSS variables not updated for dark mode

**Solution:**
- CSS variables in `AuthUI.css` use `@media (prefers-color-scheme: dark)`
- Ensure your OS or browser has dark mode enabled
- Or manually test with DevTools

---

## Optional: Google One Tap Sign-In

⚠️ **Note:** This is optional. The popup strategy works fine without it.

### What is One Tap?

A credential picker that appears automatically when user visits your site while logged into Google. Users can sign in with one click, no popup needed.

### Enable One Tap

1. Set in `.env.local`:
   ```
   VITE_ENABLE_ONE_TAP=true
   VITE_GOOGLE_CLIENT_ID=your_client_id_from_google_cloud
   ```

2. Get Google Client ID:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - APIs & Services → Credentials
   - Create OAuth 2.0 Client ID (Web)
   - Copy Client ID

3. One Tap will now appear (only if user is logged into Google)

### One Tap Configuration

One Tap is configured in `AuthContext.jsx`:

```javascript
provider.setCustomParameters({
  hd: 'yourdomain.com',  // Restrict to domain (optional)
  prompt: 'select_account' // Always show account selector
});
```

---

## Additional Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Auth Best Practices](https://firebase.google.com/docs/auth/best-practices)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Browser Local Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## Support

For issues or questions:
1. Check **Troubleshooting** section above
2. Review Firebase Console → Authentication → Authorized domains
3. Check browser console for error messages
4. Verify `.env.local` configuration
5. Check Firebase project is active

---

**Last Updated:** February 2024
**Firebase SDK Version:** 12.9.0+
**Tested with:** React 19.2.0, Vite 7.2.4
