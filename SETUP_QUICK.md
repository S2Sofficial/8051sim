# Quick Setup Script & Checklist

Fast reference for getting authentication running.

## Prerequisites

- Node.js 16+ installed
- npm installed
- A [Firebase project](https://console.firebase.google.com) (create one if needed)
- Your Firebase configuration (from Project Settings → Your apps)

## 30-Second Setup

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Edit .env.local with your Firebase credentials
# (See "Getting Your Credentials" below)

# 3. Install if needed
npm install

# 4. Start dev server
npm run dev

# 5. Visit http://localhost:5173
# Sign in should work!
```

## Getting Your Firebase Credentials

### Step 1: Create Firebase Project (if needed)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name
4. Click "Create Project"
5. Wait for completion (~1 minute)

### Step 2: Get Configuration

1. Go to **Project Settings** (gear icon, top-left)
2. Click **Your apps** section
3. Click the **Web** app (or create one with </>)
4. Copy the config under "firebaseConfig"

Your config looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "myapp-12345.firebaseapp.com",
  projectId: "myapp-12345",
  storageBucket: "myapp-12345.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### Step 3: Enable Google Sign-In

1. Go to **Authentication** (left sidebar)
2. Click **Get Started** or **Sign-in method**
3. Click **Google**
4. Toggle **Enabled**
5. Select project email
6. Click **Save**

## Configuration Checklist

- [ ] `.env.local` created with Firebase config
- [ ] `.env.local` added to `.gitignore` (should already be)
- [ ] Firebase project created
- [ ] Google sign-in enabled in Firebase
- [ ] VITE_FIREBASE_API_KEY set
- [ ] VITE_FIREBASE_AUTH_DOMAIN set
- [ ] VITE_FIREBASE_PROJECT_ID set

## For Local Development

```bash
# Add to Firebase Console → Authentication → Authorized domains:
localhost:5173
127.0.0.1:5173
```

Then you can sign in at http://localhost:5173

## For Production Deployment

### Before Deploying

1. Build your app:
   ```bash
   npm run build
   ```

2. Add your production domain to Firebase:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add: `yourdomain.com`
   - **Remove**: Any `localhost:*` entries

3. **Create .env.local for production** (with production keys if different):
   ```bash
   # Your hosting provider will set these automatically
   # OR you manually add .env.local in production environment
   VITE_FIREBASE_API_KEY=...
   # etc
   ```

4. Deploy:
   ```bash
   # Vercel
   vercel deploy

   # Netlify
   netlify deploy

   # Or your hosting provider
   ```

### After Deploying

1. Test sign-in on your live site
2. Verify authorized domains in Firebase
3. Monitor Firebase Console for errors

## Troubleshooting

### "Unauthorized redirect_uri"
- Add your domain to Firebase Console → Authorized domains
- Wait 5 minutes for changes to propagate
- Try again

### "Cannot find module '@firebase-oss/ui-react'"
- This package had issues, we don't use it
- We use core `firebase` package (already installed)
- All custom UI provided

### ".env.local is undefined"
- Restart dev server: `npm run dev`
- Verify `.env.local` exists
- Check variable names start with `VITE_`

### Sign-in button not showing
- Check browser console for errors
- Verify `AuthProvider` wraps app (in `main.jsx`)
- Clear cache and reload
- Check network tab for Firebase errors

### User logs out immediately after login
- Check domain matches exactly in Firebase
- Ensure HTTPS in production
- Check browser allows localStorage

## File Structure Recap

```
src/
├── config/firebase.js          # Firebase init
├── context/AuthContext.jsx     # Auth state
├── components/
│   ├── AuthUI.jsx              # Sign-in/Profile
│   ├── AuthUI.css              # Styles
│   ├── ProtectedFeature.jsx   # Auth guards
│   └── ProtectedFeature.css   # Guard styles
├── main.jsx                    # Calls initializeFirebase()
└── App.jsx                     # Has <AuthUI /> in header

.env.example                    # Template (copy to .env.local)
AUTHENTICATION.md               # Full guide
AUTHENTICATION_TECHNICAL.md     # Technical details
```

## Using Auth in Your Code

### Get Current User

```javascript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (isAuthenticated) return <div>Hi {user.displayName}!</div>;
  return <div>Please sign in</div>;
}
```

### Protect a Feature

```javascript
import { ProtectedFeature } from './components/ProtectedFeature';

<ProtectedFeature feature="Advanced Simulator">
  <AdvancedSimulator />
</ProtectedFeature>
```

### Sign Out

```javascript
const { logout } = useAuth();
await logout();  // Signs out user
```

## Common Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm lint
```

## Next Steps

1. ✅ Configure `.env.local` with Firebase credentials
2. ✅ Run `npm run dev`
3. ✅ Test sign-in at http://localhost:5173
4. ✅ Read `AUTHENTICATION.md` for full documentation
5. ✅ Deploy to production with authorized domains
6. ✅ Monitor Firebase Console

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React Hooks Guide](https://react.dev/reference/react/useContext)
- [Firebase Console](https://console.firebase.google.com)

## Environment Variables Reference

Required:
```
VITE_FIREBASE_API_KEY          - Firebase API Key
VITE_FIREBASE_AUTH_DOMAIN      - Firebase Auth Domain
VITE_FIREBASE_PROJECT_ID       - Firebase Project ID
```

Optional:
```
VITE_FIREBASE_STORAGE_BUCKET   - Storage Bucket
VITE_FIREBASE_MESSAGING_SENDER_ID - Messaging ID
VITE_FIREBASE_APP_ID           - App ID
VITE_FIREBASE_MEASUREMENT_ID   - Analytics ID
VITE_ENABLE_ONE_TAP            - Enable Google One Tap (true/false)
VITE_GOOGLE_CLIENT_ID          - Google Client ID (if using One Tap)
```

---

**Ready to start?** → Run `cp .env.example .env.local` and fill in your Firebase credentials!
