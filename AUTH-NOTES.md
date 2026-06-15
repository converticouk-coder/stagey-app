# Stagey Mobile — Auth & Session Notes

This scaffold consumes the **live** backend at `https://stage-ly-adam975.replit.app`.

## Auth endpoints (verified live)
- `POST /api/auth/login` → returns `{ user, adultTransition? }` (we unwrap `.user`)
- `POST /api/auth/signup` → returns `{ user }` (we unwrap `.user`)
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password` (always succeeds — no account enumeration)
- `POST /api/auth/reset-password` (`{ token, password }`)
- `GET  /api/auth/user` → returns the sanitized user object directly

> The older foundation paths (`/api/login`, etc.) hit the SPA fallback (200 HTML)
> and are NOT real endpoints — `services/api.ts` was corrected to the `/api/auth/*`
> routes above.

## ⚠️ Session cookie risk (untested on device)
The backend uses **`express-session` cookie auth** (`connect.sid`). On native
React Native, `fetch` cookie handling depends on the platform's native cookie
store, and `Set-Cookie` is not always surfaced/persisted reliably the way it is
in a browser.

**Not yet verified on a real device / simulator:**
- whether `connect.sid` is stored after `POST /api/auth/login`, and
- whether it is replayed on the follow-up `GET /api/auth/user` round-trip.

This was **not** tested here to avoid creating a real production account and
polluting the GoHighLevel CRM. If login does not persist on device, the fix is
to add a native cookie manager (e.g. `@react-native-cookies/cookies`) or switch
the API client to a token/credentials strategy — handle in the auth follow-up.

## Why no install / simulator run here
`npm install` for a subdirectory is blocked in this environment (the packager
installs to the repo root, which would pollute the web app). `node_modules` is
therefore not installed and the Expo dev server / simulator could not be run.
All TypeScript files were syntax-checked with esbuild instead.

### To run locally
```bash
cd stagey-mobile
npm install          # or: yarn / pnpm install
npx expo start       # press i (iOS) / a (Android), or scan with Expo Go
```

## Hard rules (from the task spec)
- **Never** call `/api/admin/*` — the admin console is web-only. The "Admin
  Panel" menu item is a placeholder only.
- Screen names in `navigation/index.tsx` match `types/index.ts` exactly and must
  not be renamed.
- Every screen respects safe-area insets (`useSafeAreaInsets`).
- App defaults to **dark** mode; the preference persists via
  `STORAGE_KEYS.THEME`.
