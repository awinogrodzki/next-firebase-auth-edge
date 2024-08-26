'use server';

import {signInWithEmailAndPassword} from 'firebase/auth';
import {refreshCookiesWithIdToken} from 'next-firebase-auth-edge/lib/next/cookies';
import {getFirebaseAuth} from '../auth/firebase';
import {cookies, headers} from 'next/headers';
import {authConfig} from '../../config/server-config';
import {redirect} from 'next/navigation';

export async function loginAction(username: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    username,
    password
  );

  const idToken = await credential.user.getIdToken();
  await refreshCookiesWithIdToken(idToken, headers(), cookies(), authConfig);
  redirect('/');
}
