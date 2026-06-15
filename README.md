# Stagey Mobile App

The official Stagey mobile app for iOS and Android, built with Expo / React Native.

It connects to your **live Stagey website** at `https://stage-ly-adam975.replit.app`,
so it shows the **same** users, shows, articles, societies and everything else —
and stays in sync automatically as your website's data changes. This project does
**not** have its own database; it reads and writes through your website's API.

---

## How to run it on your phone (first time)

You'll need the free **Expo Go** app on your phone:
- iPhone: App Store → search "Expo Go"
- Android: Google Play → search "Expo Go"

Then, in this Replit project:

1. Press the green **Run** button at the top.
   - The first run takes a couple of minutes — it's installing the app's parts.
   - It will then start in **tunnel mode** and print a **QR code** in the console.
2. Open **Expo Go** on your phone:
   - iPhone: open the **Camera** app and point it at the QR code, then tap the banner.
   - Android: open **Expo Go** → tap **Scan QR code** → point at the QR.
3. Stagey will load on your phone. 🎭

> If the QR is hard to scan, the console also prints a link that starts with
> `exp://`. In Expo Go you can type that link in manually to connect.

Keep this Replit project running while you're testing — the phone connects to it live.

---

## Publishing to the App Store & Google Play

Everything needed is already prepared in the **`store/`** folder:

- `store/SUBMISSION-RUNBOOK.md` — full step-by-step guide to get on both stores
- `store/STORE-LISTING.md` — your app's store text (description, keywords, etc.)
- `store/PRIVACY-AND-DATA-USE.md` — the privacy answers both stores require
- `eas.json` — the build configuration
- `app.json` — app name, icons, version, permissions
- `assets/` — your app icon and splash screen (already wired in)

Publishing to the stores requires accounts only you can create (Apple Developer
$99/yr, Google Play $25 one-time) plus a free Expo account. The runbook walks
through all of it.

---

## Important

- **Do not change** the API address in `services/api.ts`
  (`https://stage-ly-adam975.replit.app`). That's the bridge to your live data.
- As long as your Stagey **website stays published**, this app keeps working and
  stays in sync.
