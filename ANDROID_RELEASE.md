# Android Play release

The Play app is `com.varktraditions.ayyappaseva`. Keep this application ID when uploading updates. The separate `.demo` application is only for local demonstrations.

## Signing

The existing upload keystore is managed in the Expo account for this project. Use `eas credentials --platform android`, choose `production`, then **credentials.json → Download credentials from EAS to credentials.json** to retrieve it for local Gradle builds. This downloads credentials; it does not start a cloud build.

`android/app/build.gradle` reads the downloaded `credentials.json`. Release builds must use that upload key, not `android/app/debug.keystore`. Debug and demo builds continue using the public testing key.

Keep `credentials.json` and `credentials/android/keystore.jks` private and backed up securely. Both are excluded from Git. Never include passwords or private keys in this document, Gradle files, or release notes. Restrict downloaded files to the owner with `chmod 600`.

The registered upload certificate SHA-256 fingerprint (public information) is:

`C2:A6:65:47:17:61:05:51:5F:24:8D:2B:04:EF:68:1D:E4:F1:31:E0:3F:D0:66:BB:7D:4E:06:7F:9D:AE:ED:D8`

## Local build

Use Node 20.19+ (Node 24 was used for this release), JDK 17, and the Android SDK. Set `JAVA_HOME` and `ANDROID_HOME` to their installed locations and put the supported Node runtime on `PATH`.

```sh
npm run typecheck
npm test
cd android
NODE_ENV=production ./gradlew :app:bundleRelease :app:assembleRelease --no-daemon --max-workers=2
```

- Upload `android/app/build/outputs/bundle/release/app-release.aab` to the existing Play app.
- Use `android/app/build/outputs/apk/release/app-release.apk` for standalone local testing.
- These builds embed the JavaScript bundle and do not need Expo Go, Metro, or a USB connection to run.
- Increase `android.defaultConfig.versionCode` in `android/app/build.gradle` and `expo.android.versionCode` in `app.json` for each new uploaded Android version. Keep the version names aligned.
- Verify the signer, package/version, final merged permissions, and 16 KB native-library alignment before upload. Test the release APK on Android.

## Permissions and testing

Document uploads use the system file picker. Saving a bundled wallpaper needs no gallery-read permission. Android 13+ saves directly; older supported Android versions use the media library's write-only permission flow. iOS keeps its existing permission behavior.

As verified in Play Console on September 7, 2026, the developer account is now an Organization account and the production-release workflow is available. Production remains inactive; account verification and uploading a bundle do not publish the app. Before the conversion, the Personal account required at least 12 testers opted in continuously for 14 days, followed by an application for production access. The build 3 notes below record that earlier workflow.

Testers already opted into internal testing must opt out of that test before joining the closed test. Share the closed-test opt-in link only once the closed release is available:

https://play.google.com/apps/testing/com.varktraditions.ayyappaseva

## Version 1.0.1 (3) — September 5, 2026

- Built locally and signed with the registered upload key; no Expo Go or Metro dependency.
- Internal testing updated to build 3, replacing the old permission-heavy build 1.
- Closed testing Alpha submitted to Google Play. Automated checks completed, and Publishing overview confirmed **Changes in review** at handoff. This is not a public production release or confirmation of approval.
- The **Ayyappa Seva Closed Testing** email list contains the 12 supplied tester addresses. Membership alone does not start the required testing period. The private CSV is under the ignored build directory, not in Git.
- Updated the store description, privacy-policy URL, Data safety answers, advertising-ID declaration, and reviewer access instructions to match the current Firebase-backed app. No reviewer passwords are recorded here.
- Replaced five prototype screenshots with six unedited Android emulator captures. The old images remain recoverable in the Play asset library and repository.

Artifacts are in `build/google-play-1.0.1-3/`:

- `AyyappaSeva-1.0.1-3.aab` — uploaded Play bundle
- `AyyappaSeva-1.0.1-3.apk` — standalone installation package
- `screenshots/` — six verified 1080 × 1920 PNG files

Bundle SHA-256: `294dd9b59714612a23de4ba2a48b570f60f5d43fc31283a58c0a1d60a3b536f0`

Verification: typecheck and 43 tests passed; release signatures matched the registered certificate; APK ZIP alignment and all 44 bundled 64-bit native libraries passed 16 KB alignment checks. On a clean Android 36 emulator, verified launch, language selection, public navigation, document rendering and Back navigation, reviewer admin sign-in, and logout returning to Home. No AndroidRuntime or ReactNativeJS error logs were observed. No live events or announcements were created or deleted during this smoke test.

## Version 1.0.1 (4) — September 7, 2026

- Built from the latest committed app changes through `c9d71d1`, with Android versionCode increased to 4 in both configuration files. Version name remains 1.0.1. iOS build 6 was not changed.
- Includes updated temple photographs and Home framing, the welcome flower-petal animation, screen transitions, and the wallpaper carousel improvements. The requested welcome chant audio is not implemented and is not included.
- Built locally with the existing upload key for all four supported ABIs. The release APK embeds its JavaScript and does not require Expo Go, Metro, or a cable.
- Uploaded to the existing Google Play app. The bundle library initially confirmed **version code 4 / version name 1.0.1 / Inactive**, uploaded September 8 at 01:38 UTC (September 7 in America/New_York). The production submission was subsequently requested as recorded below. Build 3 remains active for existing testing tracks.
- Typecheck and all 64 tests passed. Both release signatures matched the registered certificate. Package, versions, non-debuggable release configuration, restricted permissions, and all four ABIs were checked. APK ZIP alignment and all 44 bundled 64-bit native libraries passed 16 KB alignment checks. AAB and APK contain identical JavaScript bundles.
- Installed the standalone release APK on an Android 36 arm64 emulator and verified launch, language selection, the updated Home image, Home/Temple footer navigation, and wallpaper preview/swiping. No AndroidRuntime or ReactNativeJS errors appeared for the tested app process. The emulator's initial WebView package update interrupted one launch; relaunching after that system update succeeded. No admin records or live content were changed. No physical Android phone was connected for this verification.

Artifacts are in the Git-ignored `build/google-play-1.0.1-4/` directory:

- `AyyappaSeva-1.0.1-4.aab` — uploaded Play bundle
- `AyyappaSeva-1.0.1-4.apk` — standalone installation package
- `release-notes.txt` — prepared notes; the same text was entered into the production release using its existing `en-GB` locale
- `launch.png`, `home.png`, `wallpapers.png`, and `wallpapers-swiped.png` — emulator smoke-test captures

Bundle SHA-256: `e833216c242a39a444bc8c979335cc991ac9f7571c0db0ce4f6f811965c7e453`

APK SHA-256: `1d53f6efbf0e18a4342750f70591ec096d130a0e1e057a94dce8d54967da6087`

### Production submission requested — September 7, 2026

- Created production release `1.0.1 (4) — Atlanta Ayyappa Temple`, selecting only version code 4 from the bundle library and saving the English release notes.
- With explicit user approval, matched the existing Alpha testing-country set, excluding China. Verified the exact set before saving: 176 regions (175 named countries/regions plus Rest of world), no additional countries and no missing approved countries. Existing testing tracks were not edited or synced.
- Release validation showed no blocking errors and one warning about a missing deobfuscation file. Native debug symbols were attached to the bundle; minification is disabled by default in this project's release configuration.
- Confirmed **Send changes for review** for exactly three changes: the build 4 production full rollout, 175 country additions, and Rest of world.
- Publishing overview showed **Changes in review** at approximately September 8, 02:14 UTC (September 7, 22:14 America/New_York). Automated quick checks were still running, with the console stating that changes would be sent for review when those checks complete successfully. This is not confirmation of approval or public availability.
- Managed publishing was already off and was left unchanged, so publication is automatic after approval. No iOS submission, Git commit, or Git push was performed.
