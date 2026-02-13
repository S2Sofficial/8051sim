# 🔐 Google Authentication - Quick Reference Card

**Print this card or bookmark for quick access**

---

## ⚡ 30-Second Setup

```bash
cp .env.example .env.local
# Edit .env.local with Firebase credentials

npm run dev
# Visit http://localhost:5173
# Sign-in works!
```

---

## 📋 Essential Configuration

### Required .env.local Variables
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Firebase Setup
1. Create project: https://console.firebase.google.com
2. Enable Google Sign-In (Authentication → Sign-in methods)
3. Add to Authorized domains: `localhost:5173` (dev), `yourdomain.com` (prod)

---

## 🎯 Essential Code Snippets

### Get Current User
```javascript
import { useAuth } from './context/AuthContext';

const { user, isAuthenticated, loading } = useAuth();
```

### Show Sign-In Button
```jsx
import AuthUI from './components/AuthUI';

<AuthUI />
```

### Protect Component
```jsx
import { ProtectedFeature } from './components/ProtectedFeature';

<ProtectedFeature feature="Feature Name">
  <YourComponent />
</ProtectedFeature>
```

### Conditional Render
```jsx
import { AuthGuard } from './components/ProtectedFeature';

<AuthGuard>
  <AuthenticatedContent />
</AuthGuard>
```

### Handle Logout
```javascript
const { logout } = useAuth();
await logout();
```

---

## 📁 File Structure

```
src/config/firebase.js          ← Firebase init
src/context/AuthContext.jsx     ← Auth state
src/components/AuthUI.jsx       ← Sign-in/Profile UI
src/components/ProtectedFeature.jsx ← Auth guards
src/main.jsx                    ← Added AuthProvider
src/App.jsx                     ← Added AuthUI
```

---

## 🐛 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| "Unauthorized redirect_uri" | Add domain to Firebase |
| Sign-in button missing | Restart dev server |
| User logs out on refresh | Verify domain exactly matches |
| Config error | Check .env.local has all variables |

---

## 📚 Documentation Map

| Document | Purpose | Time |
|----------|---------|------|
| **AUTH_README.md** | Overview | 5 min |
| **SETUP_QUICK.md** | Setup | 5 min |
| **EXAMPLES.md** | Code examples | 20 min |
| **AUTHENTICATION.md** | Complete guide | 40 min |
| **AUTHENTICATION_TECHNICAL.md** | Technical | 40 min |

---

## ✅ Success Checklist

- [ ] Sign-in button appears
- [ ] Google popup opens
- [ ] Can log in
- [ ] User profile shows
- [ ] Stays logged in on refresh
- [ ] Logout works
- [ ] Build succeeds

---

## 🎓 API Reference

### useAuth()
```
{
  user,                    // Firebase User | null
  isAuthenticated,         // boolean
  loading,                 // boolean
  error,                   // Error | null
  signInWithGoogle,        // async function()
  logout                   // async function()
}
```

### AuthUI
```jsx
<AuthUI />  // Sign-in button or profile
```

### ProtectedFeature
```jsx
<ProtectedFeature feature="Name">
  <Component />
</ProtectedFeature>
```

### AuthGuard / PublicGuard
```jsx
<AuthGuard><Only if auth /></AuthGuard>
<PublicGuard><Only if not auth /></PublicGuard>
```

---

## 🔧 Customization

### Change Colors
Edit `src/components/AuthUI.css`:
```css
--auth-primary-color: #your-color;
```

### Restrict to Email Domain
Edit `src/context/AuthContext.jsx`:
```javascript
provider.setCustomParameters({
  hd: 'yourdomain.com'
});
```

### Add Scopes
```javascript
provider.addScopes([
  'profile',
  'email',
  'https://www.googleapis.com/auth/calendar.readonly'
]);
```

---

## 🚀 Deployment

### Before Deploy
- [ ] Add production domain to Firebase
- [ ] Remove localhost entries
- [ ] HTTPS enabled
- [ ] Build: `npm run build`

### After Deploy
- [ ] Test sign-in on live site
- [ ] Monitor Firebase Console

---

## 📞 Resources

- Firebase: https://firebase.google.com/docs/auth
- Google OAuth: https://developers.google.com/identity
- React Hooks: https://react.dev/reference/react/useContext
- Console: https://console.firebase.google.com

---

## 💡 Pro Tips

✅ Use `useAuth()` everywhere (no prop drilling)
✅ Use `ProtectedFeature` for components
✅ Check `EXAMPLES.md` for your use case
✅ Keep `.env.local` safe (never commit)
✅ Test domain config early
✅ Read guides when stuck

---

## ⚠️ Common Mistakes

❌ Don't hardcode Firebase config
❌ Don't commit `.env.local`
❌ Don't forget authorized domains
❌ Don't use localhost in production
❌ Don't disable HTTPS in production
❌ Don't ignore errors in console

---

## 🎉 Ready?

1. Start: Copy to `.env.local`
2. Setup: Add Firebase credentials
3. Domain: Add `localhost:5173` to Firebase
4. Test: `npm run dev`
5. Build: `npm run build`
6. Deploy: Push to production

**Questions?** → See DOCS_INDEX.md for full documentation

---

**Last Updated:** February 2024
**Status:** ✅ Production-Ready
