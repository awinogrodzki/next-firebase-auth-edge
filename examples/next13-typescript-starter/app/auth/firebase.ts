import {getApp, getApps, initializeApp} from 'firebase/app';
import {connectAuthEmulator, getAuth} from 'firebase/auth';
import {clientConfig} from '../../config/client-config';
import {getOrInitializeAppCheck} from '../../app-check';

export const getFirebaseApp = () => {
  if (getApps().length) {
    return getApp();
  }

  const app = initializeApp(clientConfig);

  if (process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY) {
    getOrInitializeAppCheck(app);
  }

  return app;
};

export function getFirebaseAuth() {
  const auth = getAuth(getFirebaseApp());

  if (process.env.NEXT_PUBLIC_EMULATOR_HOST) {
    // https://stackoverflow.com/questions/73605307/firebase-auth-emulator-fails-intermittently-with-auth-emulator-config-failed
    (auth as unknown as any)._canInitEmulator = true;
    connectAuthEmulator(auth, process.env.NEXT_PUBLIC_EMULATOR_HOST, {
      disableWarnings: true
    });
  }

  return auth;
}
