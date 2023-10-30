---
"next-firebase-auth-edge": patch
---

Check if the FIREBASE_AUTH_EMULATOR_HOST has already http:// added to it, otherwise you will get a cryptic fetch failed error.
