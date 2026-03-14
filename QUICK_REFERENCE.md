# Quick Reference

## Commands

```bash
# install dependencies
npm install

# run development server
npm run dev

# production build
npm run build

# preview production build
npm run preview

# lint
npm run lint
```

## Required Env

```bash
VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
```

## Key Files

- `src/main.jsx`: app bootstrap and `ClerkProvider`
- `src/App.jsx`: top-level layout and navbar
- `src/components/AuthUI.jsx`: login/profile UI
- `src/components/AuthUI.css`: auth styling
- `src/components/ProtectedFeature.jsx`: auth guards

## Common Checks

1. Login UI missing:
Verify `AuthUI` is present in `src/App.jsx` header.

2. Clerk not initializing:
Confirm env variable and restart Vite.

3. Protected content not rendering:
Check `isLoaded` and `isSignedIn` logic.

## Related Docs

- `README.md`
- `SETUP_QUICK.md`
- `AUTHENTICATION.md`
- `TEST_PROGRAMS.md`
