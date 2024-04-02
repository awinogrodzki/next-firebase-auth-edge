'use client';

import * as React from 'react';
import {useLoadingCallback} from 'react-loading-hook';
import {
  getGoogleProvider,
  loginWithProvider,
  loginWithProviderUsingRedirect
} from './firebase';
import styles from './login.module.css';
import {Button} from '../../ui/Button';
import {LoadingIcon} from '../../ui/icons';
import Link from 'next/link';
import {ButtonGroup} from '../../ui/ButtonGroup';
import {MainTitle} from '../../ui/MainTitle';
import {PasswordForm} from '../../ui/PasswordForm';
import {PasswordFormValue} from '../../ui/PasswordForm/PasswordForm';
import {
  getRedirectResult,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink
} from 'firebase/auth';
import {getFirebaseAuth} from '../auth/firebase';
import {appendRedirectParam} from '../shared/redirect';
import {useRedirect} from '../shared/useRedirect';
import {useRedirectParam} from '../shared/useRedirectParam';
import {useAuth} from '../auth/AuthContext';

export function LoginPage() {
  const [hasLogged, setHasLogged] = React.useState(false);
  const redirect = useRedirectParam();
  const {hasLoaded} = useAuth();

  useRedirect();

  const [handleLoginWithEmailAndPassword, isEmailLoading, emailPasswordError] =
    useLoadingCallback(async ({email, password}: PasswordFormValue) => {
      setHasLogged(false);

      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);

      setHasLogged(true);
    });

  const [handleLoginWithGoogle, isGoogleLoading, googleError] =
    useLoadingCallback(async () => {
      setHasLogged(false);

      const auth = getFirebaseAuth();
      await loginWithProvider(auth, getGoogleProvider(auth));

      setHasLogged(true);
    });

  const [
    handleLoginWithGoogleUsingRedirect,
    isGoogleUsingRedirectLoading,
    googleUsingRedirectError
  ] = useLoadingCallback(async () => {
    setHasLogged(false);

    const auth = getFirebaseAuth();
    await loginWithProviderUsingRedirect(auth, getGoogleProvider(auth));

    setHasLogged(true);
  });

  async function handleLoginWithRedirect() {
    const auth = getFirebaseAuth();
    const credential = await getRedirectResult(auth);

    if (credential?.user) {
      setHasLogged(true);
    }
  }

  React.useEffect(() => {
    handleLoginWithRedirect();
  }, []);

  const [handleLoginWithEmailLink, isEmailLinkLoading, emailLinkError] =
    useLoadingCallback(async () => {
      const auth = getFirebaseAuth();
      const email = window.prompt('Please provide your email');

      if (!email) {
        return;
      }

      window.localStorage.setItem('emailForSignIn', email);

      await sendSignInLinkToEmail(auth, email, {
        url: process.env.NEXT_PUBLIC_ORIGIN + '/login',
        handleCodeInApp: true
      });
    });

  async function handleLoginWithEmailLinkCallback() {
    const auth = getFirebaseAuth();
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      return;
    }

    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }

    if (!email) {
      return;
    }

    setHasLogged(false);

    await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem('emailForSignIn');

    setHasLogged(true);
  }

  React.useEffect(() => {
    handleLoginWithEmailLinkCallback();
  }, []);

  return (
    <div className={styles.page}>
      <MainTitle>
        Login {!hasLoaded && <LoadingIcon className={styles.titleIcon} />}
      </MainTitle>
      {hasLogged && (
        <div className={styles.info}>
          <span>
            Redirecting to <strong>{redirect || '/'}</strong>
          </span>
          <LoadingIcon />
        </div>
      )}
      {!hasLogged && (
        <PasswordForm
          disabled={!hasLoaded}
          loading={isEmailLoading}
          onSubmit={handleLoginWithEmailAndPassword}
          error={
            emailPasswordError ||
            googleError ||
            emailLinkError ||
            googleUsingRedirectError
          }
        >
          <ButtonGroup>
            <Link
              className={styles.link}
              href={appendRedirectParam('/reset-password', redirect)}
            >
              Reset password
            </Link>
            <Link href={appendRedirectParam('/register', redirect)}>
              <Button disabled={!hasLoaded}>Register</Button>
            </Link>
            <Button
              loading={isGoogleLoading}
              disabled={isGoogleLoading || !hasLoaded}
              onClick={handleLoginWithGoogle}
            >
              Log in with Google (Popup)
            </Button>
            <Button
              loading={isGoogleUsingRedirectLoading}
              disabled={isGoogleUsingRedirectLoading || !hasLoaded}
              onClick={handleLoginWithGoogleUsingRedirect}
            >
              Log in with Google (Redirect)
            </Button>
            <Button
              loading={isEmailLinkLoading}
              disabled={isEmailLinkLoading || !hasLoaded}
              onClick={handleLoginWithEmailLink}
            >
              Log in with Email Link
            </Button>
          </ButtonGroup>
        </PasswordForm>
      )}
    </div>
  );
}
