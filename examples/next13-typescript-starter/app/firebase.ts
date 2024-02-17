import admin from 'firebase-admin';
import {authConfig} from '../config/server-config';

const initializeApp = () => {
  // Service account credentials are empty in Google Cloud Run environment
  const hasServiceAccountCredentials =
    authConfig.serviceAccount?.projectId &&
    authConfig.serviceAccount?.clientEmail &&
    authConfig.serviceAccount?.privateKey;

  if (!hasServiceAccountCredentials) {
    return admin.initializeApp();
  }

  return admin.initializeApp({
    credential: admin.credential.cert(authConfig.serviceAccount!)
  });
};

export const getFirebaseAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  // admin.firestore.setLogFunction(console.log);

  return initializeApp();
};
