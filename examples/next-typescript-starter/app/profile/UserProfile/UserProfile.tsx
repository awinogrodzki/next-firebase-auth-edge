'use client';

import * as React from 'react';
import {useAuth} from '../../auth/AuthContext';
import styles from './UserProfile.module.css';
import {useLoadingCallback} from 'react-loading-hook';
import {Button} from '../../../ui/Button';
import {useRouter} from 'next/navigation';
import {signOut} from 'firebase/auth';
import {ButtonGroup} from '../../../ui/ButtonGroup';
import {Card} from '../../../ui/Card';
import {Badge} from '../../../ui/Badge';
import {getToken} from '@firebase/app-check';
import {getAppCheck} from '../../../app-check';
import {getFirebaseAuth} from '../../auth/firebase';

interface UserProfileProps {
  count: number;
  incrementCounter: () => void;
}

export function UserProfile({count, incrementCounter}: UserProfileProps) {
  const router = useRouter();
  const {user} = useAuth();
  const [hasLoggedOut, setHasLoggedOut] = React.useState(false);
  const [handleLogout, isLogoutLoading] = useLoadingCallback(async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
    setHasLoggedOut(true);
  });

  const [handleClaims, isClaimsLoading] = useLoadingCallback(async () => {
    const headers: Record<string, string> = {};

    // This is optional. Use it if your app supports App Check – https://firebase.google.com/docs/app-check
    if (process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY) {
      const appCheckTokenResponse = await getToken(getAppCheck(), false);

      headers['X-Firebase-AppCheck'] = appCheckTokenResponse.token;
    }

    await fetch('/api/custom-claims', {
      method: 'POST',
      headers
    });

    router.refresh();
  });

  const [handleAppCheck, isAppCheckLoading] = useLoadingCallback(async () => {
    const appCheckTokenResponse = await getToken(getAppCheck(), false);

    const response = await fetch('/api/test-app-check', {
      method: 'POST',
      headers: {
        'X-Firebase-AppCheck': appCheckTokenResponse.token
      }
    });

    if (response.ok) {
      console.info(
        'Successfully verified App Check token',
        await response.json()
      );
    } else {
      console.error('Could not verify App Check token', await response.json());
    }
  });

  const [handleIncrementCounterApi, isIncrementCounterApiLoading] =
    useLoadingCallback(async () => {
      const response = await fetch('/api/user-counters', {
        method: 'POST'
      });

      await response.json();
      router.refresh();
    });

  const [handleReCheck, isReCheckLoading] = useLoadingCallback(async () => {
    await getFirebaseAuth().currentUser?.getIdTokenResult(true);
  });

  let [isIncrementCounterActionPending, startTransition] =
    React.useTransition();

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Card className={styles.section}>
        <h3 className={styles.title}>You are logged in as</h3>
        <div className={styles.content}>
          <div className={styles.avatar}>
            {user.photoURL && <img src={user.photoURL} />}
          </div>
          <span>{user.email}</span>
        </div>

        {!user.emailVerified && (
          <div className={styles.content}>
            <Badge>Email not verified.</Badge>
            <Button
              className={styles.contentButton}
              loading={isReCheckLoading}
              disabled={isReCheckLoading}
              onClick={handleReCheck}
            >
              Re-check
            </Button>
          </div>
        )}

        <ButtonGroup>
          <div className={styles.claims}>
            <h5>Custom claims</h5>
            <pre>{JSON.stringify(user.customClaims, undefined, 2)}</pre>
          </div>
          <Button
            loading={isClaimsLoading}
            disabled={isClaimsLoading}
            onClick={handleClaims}
          >
            Refresh custom user claims
          </Button>
          {process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY && (
            <Button
              onClick={handleAppCheck}
              loading={isAppCheckLoading}
              disabled={isAppCheckLoading}
            >
              Test AppCheck integration
            </Button>
          )}
          <Button
            loading={isLogoutLoading || hasLoggedOut}
            disabled={isLogoutLoading || hasLoggedOut}
            onClick={handleLogout}
          >
            Log out
          </Button>
        </ButtonGroup>
      </Card>
      <Card className={styles.section}>
        <h3 className={styles.title}>
          {/* defaultCount is updated by server */}
          Counter: {count}
        </h3>
        <ButtonGroup>
          <Button
            loading={isIncrementCounterApiLoading}
            disabled={
              isIncrementCounterApiLoading || isIncrementCounterActionPending
            }
            onClick={handleIncrementCounterApi}
          >
            Update counter w/ api endpoint
          </Button>
          <Button
            loading={isIncrementCounterActionPending}
            disabled={
              isIncrementCounterActionPending || isIncrementCounterApiLoading
            }
            onClick={() => startTransition(() => incrementCounter())}
          >
            Update counter w/ server action
          </Button>
        </ButtonGroup>
      </Card>
    </div>
  );
}
