'use server';

import {cookies, headers} from 'next/headers';
import {getTokens} from 'next-firebase-auth-edge';
import {refreshServerCookies} from 'next-firebase-auth-edge/lib/next/cookies';
import {authConfig} from '../../config/server-config';

export async function refreshCookies() {
  const tokens = await getTokens(cookies(), authConfig);

  if (!tokens) {
    throw new Error('Unauthenticated');
  }

  await refreshServerCookies(cookies(), new Headers(headers()), authConfig);
}
