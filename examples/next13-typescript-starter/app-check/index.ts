import {
  AppCheck,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "@firebase/app-check";
import { getFirebaseApp } from "../auth/firebase";
import { FirebaseApp } from "@firebase/app";

let appCheck: AppCheck | null = null;

export function getOrInitializeAppCheck(app: FirebaseApp): AppCheck {
  if (appCheck) {
    return appCheck;
  }

  return (appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(
      process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY!
    ),
    isTokenAutoRefreshEnabled: true, // Set to true to allow auto-refresh.
  }));
}

export function getAppCheck() {
  const app = getFirebaseApp();

  return getOrInitializeAppCheck(app);
}
