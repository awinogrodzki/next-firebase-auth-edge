import {initializeServerApp} from 'firebase/app';
import {doc, getDoc, getFirestore} from 'firebase/firestore';
import {clientConfig} from '../../../config/client-config';
import {getAuth} from 'firebase/auth';

export async function getServerFirebase(authIdToken?: string) {
  const app = initializeServerApp(clientConfig, {authIdToken});
  const auth = getAuth(app);

  await auth.authStateReady();

  const db = getFirestore(app);

  return {app, auth, db};
}

export interface UserCounter {
  id: string;
  count: number;
}

export async function getUserCounter(
  userId: string,
  authToken?: string
): Promise<UserCounter | null> {
  try {
    const {db} = await getServerFirebase(authToken);

    const counterRef = doc(db, 'user-counters', userId);
    const counterSnap = await getDoc(counterRef);

    if (counterSnap.exists()) {
      return {
        id: counterSnap.id,
        ...counterSnap.data()
      } as UserCounter;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user counter:', error);
    throw error;
  }
}
