# Stagey Mobile — Publishing Runbook

Step-by-step guide to ship Stagey to the **Apple App Store** and **Google Play**.
Follow the sections in order. Anything marked **[OWNER]** must be done by the app
owner because it needs paid accounts, legal identity, or signing keys that must
stay private. Nothing secret is committed to this repo.

> Backend stays unchanged: the app talks to `https://stage-ly-adam975.replit.app`.
> Do not change the API base URL.

---

## 0. One-time prerequisites

### [OWNER] Accounts (paid — owner must create)
- **Apple Developer Program** — $99/year. <https://developer.apple.com/programs/>
  - Note your **Apple ID email**, **Team ID** (Membership page), and you'll create
    an **App Store Connect** app record (gives an **ASC App ID**).
- **Google Play Console** — one-time $25. <https://play.google.com/console/>
  - Create a **Google Cloud service account** with Play access and download its
    JSON key (used for automated submission). Keep this file private.

### Tooling (developer machine)
```bash
npm install -g eas-cli          # Expo Application Services CLI
cd stagey-mobile
npm install                     # installs all app dependencies
eas login                       # log into your Expo account
eas init                        # creates the EAS project + fills extra.eas.projectId
```
`eas init` writes the real **projectId** into `app.json` → `extra.eas.projectId`.
This is required for push notifications and builds. Commit that change.

---

## 1. Branding assets — DONE in repo
Icons and splash are already wired in `app.json` and live in `assets/`:
- `icon.png` (1024², iOS, opaque)
- `splash-icon.png` (splash, shown on `#0A0A0F`)
- `android-icon-foreground/background/monochrome.png` (adaptive icon)
- `notification-icon.png` (Android status-bar icon)
- `favicon.png` (web)

**Still needed (graphics, not code):**
- **Play feature graphic** 1024×500 — design with the brand gradient + masks.
- **Play 512×512 icon** — export from `assets/icon.png`.
- **Screenshots** for all required device sizes — see `STORE-LISTING.md`.

---

## 2. Native config — DONE in repo
`app.json` already sets: app name, `scheme: stagey` (deep links), bundle ID
`app.stagey.mobile`, Android package + `versionCode`, iOS `buildNumber`,
portrait orientation, dark UI, permissions (photos, notifications), and the
`expo-notifications` plugin.

To release a new version later: bump `expo.version` (e.g. `1.0.1`). With
`autoIncrement` in `eas.json` + `appVersionSource: remote`, EAS manages the
iOS build number and Android versionCode for you.

---

## 3. Push notifications

The client is wired end-to-end:
- `services/notifications.ts` requests permission, gets the Expo push token, and
  creates the Android channel.
- `contexts/AuthContext.tsx` registers the token (`POST /api/user/push-token`)
  on login/signup/session-restore and clears it (`DELETE /api/user/push-token`)
  on logout.
- `App.tsx` sets the foreground handler + tap listener.

### [OWNER / BACKEND] Server requirements
1. Implement `POST /api/user/push-token` and `DELETE /api/user/push-token` on the
   backend (store/remove the Expo token against the logged-in user). The mobile
   side already calls these; they are currently the only missing server piece.
2. **iOS**: EAS will create the **APNs key** during `eas credentials` / first iOS
   build (Apple Developer account required). No manual upload needed if you let
   EAS manage credentials.
3. **Android**: Expo's push service uses **FCM**. Create a Firebase project, add
   an Android app with package `app.stagey.mobile`, download `google-services.json`,
   and upload the FCM **server key / service account** to Expo:
   `eas credentials` → Android → push. (Required for Android push delivery.)

### Verifying a test notification
On a **physical device** (push tokens are not issued on simulators):
1. Build & install a dev/preview build (Section 4) and log in.
2. The app prints/registers an Expo push token (`ExponentPushToken[...]`).
   Temporarily log it from `registerDeviceToken()` or read it server-side.
3. Send a test from Expo's tool: <https://expo.dev/notifications> — paste the
   token, add a title/body, send. Confirm it arrives in foreground and background.
   (Or `curl`:)
   ```bash
   curl -X POST https://exp.host/--/api/v2/push/send \
     -H "Content-Type: application/json" \
     -d '{"to":"ExponentPushToken[xxxx]","title":"Stagey","body":"Test notification"}'
   ```

---

## 4. Builds with EAS

```bash
cd stagey-mobile

# Internal test builds (install on your own devices)
eas build --profile preview --platform android     # APK for sideloading
eas build --profile development --platform ios      # simulator/dev client

# Production store builds
eas build --profile production --platform android   # .aab for Play
eas build --profile production --platform ios        # .ipa for App Store
```
First iOS build will prompt to create/manage **signing certificates** and
**provisioning profiles** — let EAS manage them (recommended). First Android build
creates an **upload keystore** managed by EAS. **[OWNER]** Keep EAS credential
access secure; if you ever switch tools, export the keystore from
`eas credentials`.

Download the build artifacts from the EAS build page or let `eas submit` fetch
them directly (next section).

---

## 5. Submitting

### Apple App Store
1. **[OWNER]** In **App Store Connect**, create the app: name **Stagey**, bundle
   ID `app.stagey.mobile`, primary language English (UK). This yields the
   **ascAppId**.
2. Fill the listing using `STORE-LISTING.md` (name, subtitle, description,
   keywords, promo text, support/marketing/privacy URLs, category Entertainment).
3. Complete **App Privacy** using `PRIVACY-AND-DATA-USE.md`.
4. Upload screenshots (6.7" iPhone + 12.9" iPad required — or disable tablet
   support; see STORE-LISTING.md).
5. Edit `eas.json` → `submit.production.ios` with your real `appleId`,
   `ascAppId`, `appleTeamId`, then:
   ```bash
   eas submit --profile production --platform ios --latest
   ```
6. In App Store Connect, attach the build to the version, set age rating, add
   **review notes** (see below), and **Submit for Review**.

### Google Play
1. **[OWNER]** In **Play Console**, create the app (Stagey, free, category
   Entertainment). Complete: Store listing, **Data safety** (use
   PRIVACY-AND-DATA-USE.md), Content rating questionnaire, Target audience,
   and the App access / ads declarations (the app has **no ads**).
2. Upload the feature graphic (1024×500), icon (512×512) and screenshots.
3. Put the Google Play **service-account JSON** at
   `stagey-mobile/google-play-service-account.json` (it is git-ignored — never
   commit it) and confirm the path in `eas.json`.
4. Submit the production `.aab`:
   ```bash
   eas submit --profile production --platform android --latest
   ```
   The `production` submit profile targets the **internal** track as a **draft**
   first — promote it to Production in the console once you've tested.

### Review notes (paste into both stores)
```
Stagey is a community app for UK amateur and youth theatre. To review the full
experience, create a free account in-app (email + password). Some content
(masterclasses/business features) is a paid in-app purchase handled by Stripe.
All content is managed via our web admin; the app is read/write through our API.
No ads. Account deletion is available in-app under Settings.
```

---

## 6. Owner checklist (what only you can provide)

- [ ] Apple Developer account ($99/yr) — Apple ID, Team ID, ASC App ID
- [ ] Google Play Console account ($25) + service-account JSON key
- [ ] Firebase project + `google-services.json` (Android push / FCM)
- [ ] Published **privacy policy URL** (required by both stores)
- [ ] Final **screenshots** (sizes in STORE-LISTING.md) + Play **feature graphic**
- [ ] Backend `push-token` endpoints implemented (Section 3)
- [ ] Decision on iPad support (keep `supportsTablet` true ⇒ iPad screenshots)
- [ ] Confirm Stripe/GoHighLevel data-sharing declarations for Data safety

---

## Security reminder
No signing keys, certificates, service-account JSON, Apple IDs or push secrets
are stored in this repo. `eas.json` contains placeholders only; the
`google-play-service-account.json` path is git-ignored. Keep all credentials in
EAS / the store consoles, owner-managed.
