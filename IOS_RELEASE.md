# iOS release

The existing App Store Connect app is **Ayyappa Seva**, app ID `6807055617`, bundle ID `com.varktraditions.ayyappaseva.mobile`, team `AW59F4RW4A`.

## Versioning and signing

- Version 1.0.1 (build 6) was confirmed **Ready for Distribution** on September 8, 2026. Its binary cannot be replaced with these new visuals; prepare a new app version.
- The current iOS update is **1.0.2 (build 7)**. `expo.ios.version` intentionally overrides the shared `expo.version`, so the Android release remains 1.0.1 (version code 4). Expo's installed iOS version resolver supports this platform-specific field.
- Keep `expo.ios.version` and `expo.ios.buildNumber` aligned with `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION` in both Xcode target configurations. `tests/ios-release.test.cjs` checks this relationship.
- Use the existing Xcode account and signing assets. Do not commit private keys, provisioning profiles, or authentication credentials.

## Local archive

Use Node 20.19+ (Node 24 used here), Xcode, and the existing installed CocoaPods workspace. No Expo cloud build or Expo Go is required.

```sh
npm run typecheck
npm test
NODE_ENV=production xcodebuild \
  -workspace ios/AyyappaSeva.xcworkspace \
  -scheme AyyappaSeva -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/AyyappaSeva-1.0.2-7.xcarchive \
  -allowProvisioningUpdates -jobs 2 archive
```

Before uploading, verify the archived application's version/build, bundle identifier, embedded JavaScript and temple assets, signature, and app dSYM. The upload export uses `app-store-connect`, the existing team, automatic signing, and `manageAppVersionAndBuildNumber=false`.

## Version 1.0.2 (7) preparation — September 8, 2026

- Includes the latest committed temple photographs/Home framing, welcome flower-petal animation, navigation transitions, and wallpaper carousel changes through `c9d71d1`.
- Welcome chant audio remains unimplemented and is not included.
- Typecheck and all 66 tests passed, including iOS version alignment, Apple Maps, administrator navigation, no public registration, wallpaper permissions, and reduced-motion/animation lifecycle checks.
- Created App Store Connect version 1.0.2 in **Prepare for Submission**, saved What's New and refreshed reviewer notes, and selected **Manually release this version**. Existing reviewer credentials and other carried-forward metadata were not changed.
- No App Review submission or public release has been requested for this update. Android build 4's production review was left unchanged.
- Generated artifacts stay in the Git-ignored `build/` directory.

### Archive and upload verification

- `build/AyyappaSeva-1.0.2-7.xcarchive` was archived successfully with Xcode 26.6, Release configuration, for arm64 iOS devices. The archive reports the correct bundle ID, version 1.0.2, and build 7.
- The archive's code signature verified. The application executable and app dSYM both have UUID `DCC8213F-E548-341E-A198-D1A22CA4A68E`.
- The Home, welcome, and Ayyappa wallpaper assets in the archive are byte-for-byte identical to the current source images. The release embeds a 5.3 MB Hermes JavaScript bundle, with SHA-256 `60a5bd42ae31c03f7133fae65a4dd25b9b30d364e051dbdb69078d09bfec7017`.
- Uploaded with `build/AppStoreUpload-7.plist`. Xcode confirmed **Upload succeeded** and **EXPORT SUCCEEDED** on September 8, 2026 at 22:03:48 EDT (September 9 at 02:03:48 UTC). The package was processing at upload completion.
- The upload reported the existing missing third-party dSYM warnings for React, ReactNativeDependencies, and Hermes. The app's own dSYM is present and matches. These warnings did not block the upload; they limit crash symbolication inside those prebuilt frameworks.

### TestFlight and saved App Store draft

- TestFlight version 1.0.2 (7) became **Ready to Submit** and was already associated with the existing **Ayyappa Internal Testing** group (2 testers). No group membership was changed. Saved the updated What to Test instructions, including the Reduce Motion check and absence of chant audio.
- Attached build **7 / 1.0.2** to the App Store version 1.0.2 draft and saved it. Verified **Prepare for Submission**, the disabled Save button, and **Manually release this version** selected. **Add for Review** has not been clicked.
- Built the Release simulator target successfully for arm64, installed it on the iPhone 17 Pro Max iOS 26.5 simulator, and launched it successfully. Verified the installed app reports version 1.0.2 and build 7. An initial simulator shutdown interrupted the first install attempt; retrying after boot succeeded.
- Visually checked `build/ios-1.0.2-7-launch-verified.png`: the updated Home photo, Atlanta Ayyappa Temple header, and shared bottom navigation rendered correctly. This was a launch/Home smoke check, not a complete interactive iPhone/iPad regression pass.
- Before submitting for App Review, test build 7 in TestFlight and refresh the carried-forward Home/welcome App Store screenshots to match the new photography. The listing screenshots have not been replaced in this preparation step.
- No App Review submission, public release, Git commit/push, or Android submission change was made.

## Submitted for App Review — September 8, 2026

The user authorized submitting version 1.0.2 (7) and separately approved replacing the outdated Home/welcome listing screenshots.

- Captured the installed Release build 7 directly from the iPhone 17 Pro Max and iPad Pro 13-inch (M5) simulators. Visually verified Home, the Atlanta Ayyappa Temple title, navigation, and the welcome flower-petal reveal on both sizes. No image synthesis or app feature changes were used for these captures.
- Uploaded `build/ios-1.0.2-7-iphone-home.png` and `build/ios-1.0.2-7-iphone-welcome.png` (1320 × 2868) to the iPhone 6.9-inch screenshot set. Removed the old `01-Home.png` and `04-Welcome.png` from the 6.5-inch set; its existing Sacred Library, Admin, and Temple screenshots remain unchanged.
- Uploaded `build/ios-1.0.2-7-ipad-home.png` and `build/ios-1.0.2-7-ipad-welcome.png` (2064 × 2752) to the iPad 13-inch set. Removed the old `01-Home.png` and `06-Welcome.png`; retained Events, Temple, and Sacred Library and moved the new Home screenshot to the first position. The set contains five screenshots.
- App Store Connect validation passed. Added the version for review, verified the draft contained only **iOS App 1.0.2 / 1.0.2 (7)**, and clicked **Submit for Review**.
- Confirmed **1 Item Submitted** and **1.0.2 Waiting for Review** by September 8 at 22:23 EDT (September 9 at 02:23 UTC).
- Submission ID: `76d5aa20-e871-4464-b8fa-08fb35d41ce0`.
- Submission page: https://appstoreconnect.apple.com/apps/6807055617/distribution/reviewsubmissions/details/76d5aa20-e871-4464-b8fa-08fb35d41ce0
- **Manually release this version** remains selected. This submission does not authorize or perform publication after approval. The existing 1.0.1 release and Android submission remain unchanged.
- Shut down only the two simulators booted for these captures. No local files were deleted and no Git commit/push was made.
