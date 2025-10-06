# Firebase Emulator - Quick Start (Local)

This project includes a minimal emulator configuration and a small test script
to exercise authentication, Firestore and Storage flows for local development.

Prerequisites
- Node.js 16+ and npm installed
- Install firebase-tools globally (optional but recommended):
  npm install -g firebase-tools

Install dev dependencies:

```powershell
npm install
```

Start emulators (from project root):

```powershell
npx firebase emulators:start --only firestore,auth,storage
```

In another terminal run the E2E test (wait until emulators are listening):

```powershell
npm run test:emulator
```

Notes
- The test script `tests/emulator-e2e.js` is a minimal scaffold — adapt doc IDs
  and collection names to match your project if needed.
- The security rules are provided in `firestore.rules` and `storage.rules`.
- This setup is for local development only. Do not use the emulators for
  production deployments.
