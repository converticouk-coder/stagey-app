# Stagey — Privacy & Data-Use Summary (for both stores)

This file maps what the app collects to the **App Store Privacy** questionnaire
(App Store Connect) and the **Google Play Data safety** form. Confirm each line
against the live backend before final submission; the owner is responsible for
the published privacy policy.

A public privacy policy is **mandatory** for both stores. Host it at a stable URL
(e.g. `https://stagey.co.uk/privacy`) and enter it in both consoles.

---

## What the app collects

| Data | Why | Linked to user? | Used for tracking? |
|---|---|---|---|
| Email address | Account creation, login, password reset | Yes | No |
| Name (first/last) & username | Public profile, identity | Yes | No |
| Date of birth | Under-18 safeguarding (guardian consent flow) | Yes | No |
| Guardian email (minors only) | Parental consent | Yes | No |
| Profile content (bio, skills, photos, banner) | User-created profile | Yes | No |
| User-generated content (listings, messages, applications, posts) | Core features | Yes | No |
| Photos (image picker) | Uploading to listings, profiles, mood boards | Yes | No |
| Push token (device identifier for notifications) | Deliver notifications | Yes | No |
| Payment info | Masterclass / subscription purchases | **Handled by Stripe**, not stored by Stagey | No |
| Diagnostics / crash data | Stability (if you enable EAS/crash tooling) | No | No |

The app does **not** use third-party advertising SDKs and does **not** track users
across other companies' apps/sites. Answer **"No"** to App Tracking Transparency /
"Used to track you" unless that changes.

---

## Apple — App Privacy answers (App Store Connect → App Privacy)

- **Contact Info → Email Address**: Collected · Linked · App Functionality
- **Contact Info → Name**: Collected · Linked · App Functionality
- **User Content → Photos/Videos**: Collected · Linked · App Functionality
- **User Content → Other**: Collected · Linked · App Functionality
- **Identifiers → User ID**: Collected · Linked · App Functionality
- **Sensitive Info**: None (DOB is collected for age-gating; declare under
  "Other data types" → App Functionality, not advertising)
- **Purchases**: Handled by Stripe — declare "Purchase History" if you store it
  server-side; payment card data is never collected by the app.
- **Tracking**: No

> Because the app collects DOB from potential minors, complete Apple's **Kids /
> age-related** questions honestly. Stagey is a general-audience app (not in the
> Kids category) with a safeguarding flow for under-18s.

---

## Google — Data safety answers (Play Console → App content → Data safety)

For each item: **Collected = Yes**, **Shared = No** (unless you share with Stripe/GHL —
see below), **Processed ephemerally = No**, **Required = Yes** where it gates core use,
**Encrypted in transit = Yes**.

- Personal info: Email, Name, User IDs, Date of birth
- Photos and videos: Photos
- Messages: In-app messages
- App activity: User-generated content, app interactions
- Device or other IDs: Push token

**Data sharing**: If the backend forwards data to **Stripe** (payments) and
**GoHighLevel** (CRM/email), declare those as data shared with service providers
and describe the purpose. These are server-side integrations — confirm scope with
the owner before ticking "shared".

**Security practices**: Data is encrypted in transit (HTTPS). Provide a way to
request account deletion — the app exposes `DELETE /api/users/me`
(`AuthAPI.deleteAccount`). Add the account-deletion URL/steps in the Play Data
safety "deletion" section (Play requires this).

---

## Permissions declared

| Permission | Platform | Reason | Where |
|---|---|---|---|
| Photo library access | iOS/Android | Upload images to listings/profiles/mood boards | `expo-image-picker` plugin (`photosPermission`) |
| Notifications | iOS/Android | Casting matches, messages, society updates | `expo-notifications` + `android.permissions: ["NOTIFICATIONS"]` |
| Remote notification background mode | iOS | Receive push while backgrounded | `ios.infoPlist.UIBackgroundModes` |

`ITSAppUsesNonExemptEncryption` is set to `false` (the app only uses standard
HTTPS), which clears Apple's export-compliance question automatically.
