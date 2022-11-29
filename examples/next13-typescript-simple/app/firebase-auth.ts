import { FirebaseApp, FirebaseOptions, getApp } from '@firebase/app';

const getFirebaseApp = async (options: FirebaseOptions) => {
  const { getApp, getApps, initializeApp } = await import('firebase/app');

  return (!getApps().length ? initializeApp(options) : getApp()) as FirebaseApp;
};

const getAuth = async (options: FirebaseOptions) => {
  const app = await getFirebaseApp(options);
  const { getAuth } = await import('firebase/auth');

  return getAuth(app);
};

export const useFirebaseAuth = (options: FirebaseOptions) => {
  const getFirebaseAuth = async () => {
    return getAuth(options);
  };

  return { getFirebaseAuth };
};
