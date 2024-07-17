'use client';

import {getToken} from '@firebase/app-check';
import * as React from 'react';
import {useLoadingCallback} from 'react-loading-hook';

import {
  sendEmailVerification,
  signInWithCustomToken,
  signOut
} from 'firebase/auth';
import {useRouter, useSearchParams} from 'next/navigation';
import {checkEmailVerification, logout} from '../../../api';
import {getAppCheck} from '../../../app-check';
import {Badge} from '../../../ui/Badge';
import {Button} from '../../../ui/Button';
import {ButtonGroup} from '../../../ui/ButtonGroup';
import {Card} from '../../../ui/Card';
import {useAuth} from '../../auth/AuthContext';
import {getFirebaseAuth} from '../../auth/firebase';
import styles from './UserProfile.module.css';
import {incrementCounterUsingClientFirestore} from './user-counters';
import {verifyEmailUpdate} from './verify-email-update';
import {FormError} from '../../../ui/FormError';

interface UserProfileProps {
  count: number;
  incrementCounter: () => void;
}

export function UserProfile({count, incrementCounter}: UserProfileProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {user} = useAuth();
  const [hasLoggedOut, setHasLoggedOut] = React.useState(false);
  const [handleLogout, isLogoutLoading] = useLoadingCallback(async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
    await logout();

    router.refresh();

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

  const [handleIncrementCounterClient, isIncrementCounterClientLoading] =
    useLoadingCallback(async () => {
      if (!user) {
        return;
      }

      await incrementCounterUsingClientFirestore(user.customToken);

      router.refresh();
    });

  const [handleReCheck, isReCheckLoading] = useLoadingCallback(async () => {
    await checkEmailVerification();
    router.refresh();
  });

  const [handleAuthCode, isAuthCodeLoading, authCodeError] = useLoadingCallback(
    async () => {
      const code = window.prompt('Enter oobCode')

      if (!code) {
        return;
      }

      await verifyEmailUpdate(code);
      router.refresh();
    }
  );

  const [handleVerification, isVerificationLoading, verificationError] =
    useLoadingCallback(async () => {
      if (!user) {
        throw new Error('No access');
      }

      //https://next-firebase-auth-edge-demo.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=&lang=en
      const credential = await signInWithCustomToken(
        getFirebaseAuth(),
        user.customToken
      );
      await sendEmailVerification(credential.user, {
        url: `http://localhost/profile?code=code`
      });
    });

  let [isIncrementCounterActionPending, startTransition] =
    React.useTransition();

  if (!user) {
    return null;
  }

  const error = authCodeError ?? verificationError;

  const isIncrementLoading =
    isIncrementCounterApiLoading ||
    isIncrementCounterActionPending ||
    isIncrementCounterClientLoading;

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
          {error && <FormError>{error.message}</FormError>}
          <Button
            loading={isClaimsLoading}
            disabled={isClaimsLoading}
            onClick={handleClaims}
          >
            Refresh custom user claims
          </Button>
          <Button
            loading={isVerificationLoading}
            disabled={isVerificationLoading}
            onClick={handleVerification}
          >
            Send verification email
          </Button>
          <Button
            loading={isAuthCodeLoading}
            disabled={isAuthCodeLoading}
            onClick={handleAuthCode}
          >
            Verify code
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
            disabled={isIncrementLoading}
            onClick={handleIncrementCounterApi}
          >
            Update counter w/ api endpoint
          </Button>
          <Button
            loading={isIncrementCounterActionPending}
            disabled={isIncrementLoading}
            onClick={() => startTransition(() => incrementCounter())}
          >
            Update counter w/ server action
          </Button>
          <Button
            loading={isIncrementCounterClientLoading}
            disabled={isIncrementLoading}
            onClick={handleIncrementCounterClient}
          >
            Update counter w/ client firestore sdk
          </Button>
        </ButtonGroup>
      </Card>
    </div>
  );
}
