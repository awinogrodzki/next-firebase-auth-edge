import admin from 'firebase-admin';
import {authConfig} from '../config/server-config';

const initializeApp = () => {
  if (!authConfig.serviceAccount) {
    return admin.initializeApp();
  }

  // Don't use real credentials with Firebase Emulator https://firebase.google.com/docs/emulator-suite/connect_auth#admin_sdks
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    return admin.initializeApp({
      projectId: authConfig.serviceAccount.projectId
    });
  }

  return admin.initializeApp({
    credential: admin.credential.cert(authConfig.serviceAccount)
  });
};

export const getFirebaseAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  // admin.firestore.setLogFunction(console.log);

  return initializeApp();
};
