import admin from 'firebase-admin';
import {authConfig} from '../config/server-config';

const initializeApp = () => {
  if (!authConfig.serviceAccount) {
    return admin.initializeApp();
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
