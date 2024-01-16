'use client';

import * as React from 'react';
import {useLoadingCallback} from 'react-loading-hook';
import {getGoogleProvider, loginWithProvider} from './firebase';
import styles from './login.module.css';
import {Button} from '../../ui/Button';
import {LoadingIcon} from '../../ui/icons';
import Link from 'next/link';
import {ButtonGroup} from '../../ui/ButtonGroup';
import {MainTitle} from '../../ui/MainTitle';
import {PasswordForm} from '../../ui/PasswordForm';
import {PasswordFormValue} from '../../ui/PasswordForm/PasswordForm';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {getFirebaseAuth} from '../auth/firebase';
import {appendRedirectParam} from '../shared/redirect';
import {useRedirect} from '../shared/useRedirect';
import {useRedirectParam} from '../shared/useRedirectParam';

export function LoginPage() {
  const [hasLogged, setHasLogged] = React.useState(false);
  const redirect = useRedirectParam();

  useRedirect();

  const [handleLoginWithEmailAndPassword, isEmailLoading, error] =
    useLoadingCallback(async ({email, password}: PasswordFormValue) => {
      setHasLogged(false);

      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);

      setHasLogged(true);
    });

  const [handleLoginWithGoogle, isGoogleLoading] = useLoadingCallback(
    async () => {
      setHasLogged(false);

      const auth = getFirebaseAuth();
      await loginWithProvider(auth, getGoogleProvider(auth));

      setHasLogged(true);
    }
  );

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
          loading={isEmailLoading}
          onSubmit={handleLoginWithEmailAndPassword}
          error={error}
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
              Log in with Google
            </Button>
          </ButtonGroup>
        </PasswordForm>
      )}
    </div>
  );
}
