import {NextResponse} from 'next/server';
import type { NextRequest } from 'next/server';
import {authConfig} from '../../../config/server-config';
import {getFirestore} from 'firebase-admin/firestore';
import {getTokens} from 'next-firebase-auth-edge/lib/next/tokens';
import {getFirebaseAdminApp} from '../../firebase';

export async function POST(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

  if (!tokens) {
    throw new Error('Cannot update counter of unauthenticated user');
  }

  const db = getFirestore(getFirebaseAdminApp());
  const snapshot = await db
    .collection('user-counters')
    .doc(tokens.decodedToken.uid)
    .get();

  const currentUserCounter = await snapshot.data();

  if (!snapshot.exists || !currentUserCounter) {
    const userCounter = {
      id: tokens.decodedToken.uid,
      count: 1
    };

    await snapshot.ref.create(userCounter);
    return NextResponse.json(userCounter);
  }

  const newUserCounter = {
    ...currentUserCounter,
    count: currentUserCounter.count + 1
  };
  await snapshot.ref.update(newUserCounter);

  return NextResponse.json(newUserCounter);
}
