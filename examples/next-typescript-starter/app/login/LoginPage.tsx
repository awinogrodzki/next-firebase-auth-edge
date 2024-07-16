'use client';

import {
  UserCredential,
  getRedirectResult,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink
} from 'firebase/auth';
import Link from 'next/link';
import * as React from 'react';
import {useLoadingCallback} from 'react-loading-hook';
import {loginWithCredential} from '../../api';
import {Button} from '../../ui/Button';
import {ButtonGroup} from '../../ui/ButtonGroup';
import {MainTitle} from '../../ui/MainTitle';
import {PasswordForm} from '../../ui/PasswordForm';
import {PasswordFormValue} from '../../ui/PasswordForm/PasswordForm';
import {Switch} from '../../ui/Switch/Switch';
import {LoadingIcon} from '../../ui/icons';
import {getFirebaseAuth} from '../auth/firebase';
import {appendRedirectParam} from '../shared/redirect';
import {useRedirectAfterLogin} from '../shared/useRedirectAfterLogin';
import {useRedirectParam} from '../shared/useRedirectParam';
import {
  getGoogleProvider,
  loginWithProvider,
  loginWithProviderUsingRedirect
} from './firebase';
import styles from './login.module.css';

export function LoginPage({
  loginAction
}: {
  loginAction: (email: string, password: string) => void;
}) {
  const [hasLogged, setHasLogged] = React.useState(false);
  const [shouldLoginWithAction, setShouldLoginWithAction] =
    React.useState(false);
  let [isLoginActionPending, startTransition] = React.useTransition();
  const redirect = useRedirectParam();
  const redirectAfterLogin = useRedirectAfterLogin();

  async function handleLogin(credential: UserCredential) {
    await loginWithCredential(credential);
    redirectAfterLogin();
  }

  const [handleLoginWithEmailAndPassword, isEmailLoading, emailPasswordError] =
    useLoadingCallback(async ({email, password}: PasswordFormValue) => {
      setHasLogged(false);

      const auth = getFirebaseAuth();

      if (shouldLoginWithAction) {
        startTransition(() => loginAction(email, password));
      } else {
        await handleLogin(
          await signInWithEmailAndPassword(auth, email, password)
        );

        setHasLogged(true);
      }
    });

  const [handleLoginWithGoogle, isGoogleLoading, googleError] =
    useLoadingCallback(async () => {
      setHasLogged(false);

      const auth = getFirebaseAuth();
      await handleLogin(await loginWithProvider(auth, getGoogleProvider(auth)));

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
      await handleLogin(credential);

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

    await handleLogin(
      await signInWithEmailLink(auth, email, window.location.href)
    );
    window.localStorage.removeItem('emailForSignIn');

    setHasLogged(true);
  }

  React.useEffect(() => {
    handleLoginWithEmailLinkCallback();
  }, []);

  return (
    <div className={styles.page}>
      <MainTitle>Login</MainTitle>
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
          loading={isEmailLoading || isLoginActionPending}
          onSubmit={handleLoginWithEmailAndPassword}
          actions={
            <div className={styles.loginWithAction}>
              <Switch
                value={shouldLoginWithAction}
                onChange={setShouldLoginWithAction}
              />
              Login with Server Action
            </div>
          }
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
              <Button>Register</Button>
            </Link>
            <Button
              loading={isGoogleLoading}
              disabled={isGoogleLoading}
              onClick={handleLoginWithGoogle}
            >
              Log in with Google (Popup)
            </Button>
            <Button
              loading={isGoogleUsingRedirectLoading}
              disabled={isGoogleUsingRedirectLoading}
              onClick={handleLoginWithGoogleUsingRedirect}
            >
              Log in with Google (Redirect)
            </Button>
            <Button
              loading={isEmailLinkLoading}
              disabled={isEmailLinkLoading}
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
