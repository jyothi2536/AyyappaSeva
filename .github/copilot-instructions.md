# Copilot instructions for Ayyappa Seva

## Big picture
- This is an Expo + React Native TypeScript app with a custom app shell: `App.tsx` mounts `AppProvider`, then `src/navigation/AppNavigator.tsx` renders a stack-over-tabs layout with shared `AppHeader`/`AppFooter`.
- Global app state lives in `src/state/AppContext.tsx` (language, onboarding, songs, updates, events, admin session, cloud status). New features should usually be wired through this context, not per-screen singleton state.
- Data flow is hybrid local+cloud: AsyncStorage hydrates first, then Firebase subscriptions (`events`, `updates`, `admins`) replace cached data when configured.
- Event reminders are scheduled client-side via `src/services/eventNotifications.ts` when events are created/edited/deleted.

## Core service boundaries
- `src/services/firebase.ts`: Firestore/Auth reads/writes, admin auth, role checks, and realtime subscriptions. Keep Firestore access centralized here.
- `src/services/maps.ts`: platform-specific map URL and fallback alert behavior.
- `src/services/documents.ts`: DOCX parsing and bundled document preparation in local app storage.
- `src/services/wallpapers.ts`: photo-library save flow with OS-version permission branching.

## Project-specific conventions
- Localization is strongly typed: `Language` is `en | te | ta | kn` in `src/types.ts`; UI copy comes from `translations` in `src/data/content.ts`; event copy is separate in `src/data/events.ts`.
- `CalendarEvent.title` and `description` are multilingual objects (`LocalizedText`), not plain strings.
- Admin login accepts username and converts to internal Firebase email (`<username>@admin.ayyappaseva.app`) in `usernameToFirebaseEmail()`.
- Keep admin routes in the main stack flow (presentation `card`), not modal sheets; tests enforce this (`tests/navigation.test.cjs`).
- Use shared UI primitives in `src/components/UI.tsx` (`Page`, `ScreenHeader`, `GoldButton`, `BackButton`, `Card`) for consistent visual/spacing behavior.

## Developer workflows
- Required runtime: Node.js 20.19.4+ (README; release docs used Node 24).
- Common commands:
  - `npm start` (Expo)
  - `npm run ios` / `npm run android`
  - `npm run typecheck` (strict TS; `noUncheckedIndexedAccess` enabled)
  - `npm test` (Node built-in test runner over `tests/*.test.cjs`)
- Tests are not Jest-based: they transpile TS with `typescript.transpileModule` and execute in VM with mocked React Native/navigation modules (see `tests/maps.test.cjs`, `tests/navigation.test.cjs`). Follow this pattern when adding tests.

## Firebase and security integration
- Firebase is optional at runtime: guard cloud-only behavior with `firebaseConfigured`/`cloudConfigured` checks.
- Firestore rules (`firestore.rules`): public read for `events`/`updates`; writes restricted to admin docs; only `superAdmin` can list/delete other admin accounts.
- When changing admin behavior, update both `src/services/firebase.ts` and `firestore.rules` assumptions together.

## Release/build notes that matter for code changes
- Android release process and signing constraints are documented in `ANDROID_RELEASE.md`.
- `app.json` intentionally blocks broad media read permissions on Android and keeps a limited write flow; preserve this posture when touching media/document features.
- For Android version bumps, align `android/app/build.gradle` `versionCode` with `app.json` `expo.android.versionCode`.
