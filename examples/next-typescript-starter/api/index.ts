import {getToken} from '@firebase/app-check';
import {getAppCheck} from '../app-check';
import {UserCredential} from 'firebase/auth';

export async function login(token: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  };

  // This is optional. Use it if your app supports App Check – https://firebase.google.com/docs/app-check
  if (process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY) {
    const appCheckTokenResponse = await getToken(getAppCheck(), false);

    headers['X-Firebase-AppCheck'] = appCheckTokenResponse.token;
  }

  await fetch('/api/login', {
    method: 'GET',
    headers
  });
}

export async function loginWithCredential(credential: UserCredential) {
  const idToken = await credential.user.getIdToken();

  await login(idToken);
}

export async function logout() {
  const headers: Record<string, string> = {};

  // This is optional. Use it if your app supports App Check – https://firebase.google.com/docs/app-check
  if (process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY) {
    const appCheckTokenResponse = await getToken(getAppCheck(), false);

    headers['X-Firebase-AppCheck'] = appCheckTokenResponse.token;
  }

  await fetch('/api/logout', {
    method: 'GET',
    headers
  });
}

export async function refreshToken() {
  const headers: Record<string, string> = {};

  // This is optional. Use it if your app supports App Check – https://firebase.google.com/docs/app-check
  if (process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY) {
    const appCheckTokenResponse = await getToken(getAppCheck(), false);

    headers['X-Firebase-AppCheck'] = appCheckTokenResponse.token;
  }

  await fetch('/api/refresh-token', {
    method: 'GET',
    headers
  });
}
