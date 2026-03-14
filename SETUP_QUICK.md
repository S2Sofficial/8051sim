# Setup Quick

Use this guide to run the simulator locally with Clerk authentication enabled.

## Prerequisites

- Node.js 20+
- npm
- Clerk publishable key

## Local Setup

```bash
git clone https://github.com/S2Sofficial/8051sim.git
cd 8051sim
npm install
cp .env.example .env.local
```

Set this in `.env.local`:

```bash
VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
```

Run the app:

```bash
npm run dev
```

## Build And Preview

```bash
npm run build
npm run preview
```

## Common Issues

1. Login button appears but auth modal does not open:
Set a valid `VITE_CLERK_PUBLISHABLE_KEY`, then restart `npm run dev`.

2. Blank auth state in UI:
Confirm `src/main.jsx` wraps the app with `ClerkProvider`.

3. Env changes do not reflect:
Stop and restart the dev server.

## Related Docs

- See `AUTHENTICATION.md` for auth-specific implementation details.
- See `QUICK_REFERENCE.md` for command and file quick lookup.

---

**Ready to start?** → Run `cp .env.example .env.local` and fill in your Firebase credentials!
