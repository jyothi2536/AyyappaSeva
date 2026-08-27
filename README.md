# Ayyappa Seva

A polished Expo/React Native prototype for a multilingual Ayyappa temple community app.

## Run

Use Node.js 20.19.4 or newer.

```bash
npm install
npm start
```

Scan the QR code with Expo Go, or press `i` / `a` for an iOS / Android simulator.

## Shared Firebase database

Copy `.env.example` to `.env` and add the Firebase Web app configuration. The app then synchronises `events` and `updates` through Cloud Firestore in real time.

Deploy `firestore.rules` before testing. Public users can read events and updates. Only signed-in users whose Firebase Auth UID exists at `admins/{uid}` can create or delete them.

Admin setup:

1. Enable Email/Password under Firebase Authentication.
2. Create the administrator under Authentication → Users.
3. Copy that user's UID.
4. Create Firestore document `admins/{uid}` with a field such as `role: "admin"`.
5. Use that email and password on the app's Admin screen.

## Included

- Animated devotional home screen
- Temple address and contact actions
- Telugu, Tamil, Kannada, and English UI
- PDF/audio/document upload and local viewing
- Devotee registration
- Temple updates
- Firebase-authenticated admin publishing area
- Shared temple events, Padi Pujas and announcements

Uploaded song files and devotee registration remain device-local for now. Event and announcement data use Firebase when `.env` is configured.
