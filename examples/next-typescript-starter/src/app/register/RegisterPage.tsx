'use client';

import * as React from 'react';
import {useLoadingCallback} from 'react-loading-hook';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import Link from 'next/link';
import {getFirebaseAuth} from '../auth/firebase';
import {Button} from '../../ui/Button';
import {MainTitle} from '../../ui/MainTitle';
import {PasswordForm} from '../../ui/PasswordForm';
import {PasswordFormValue} from '../../ui/PasswordForm/PasswordForm';
import {LoadingIcon} from '../../ui/icons';
import {appendRedirectParam} from '../shared/redirect';
import {useRedirectParam} from '../shared/useRedirectParam';
import styles from './register.module.css';
import {useRedirectAfterLogin} from '../shared/useRedirectAfterLogin';
import {loginWithCredential} from '../../api';

export function RegisterPage() {
  const [hasLogged, setHasLogged] = React.useState(false);
  const redirect = useRedirectParam();
  const redirectAfterLogin = useRedirectAfterLogin();

  const [registerWithEmailAndPassword, isRegisterLoading, error] =
    useLoadingCallback(async ({email, password}: PasswordFormValue) => {
      setHasLogged(false);
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await loginWithCredential(credential);
      await sendEmailVerification(credential.user);
      redirectAfterLogin();

      setHasLogged(true);
    });

  return (
    <div className={styles.page}>
      <MainTitle>Register</MainTitle>
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
          onSubmit={registerWithEmailAndPassword}
          loading={isRegisterLoading}
          error={error}
        >
          <Link href={appendRedirectParam('/login', redirect)}>
            <Button disabled={isRegisterLoading}>Back to login</Button>
          </Link>
        </PasswordForm>
      )}
    </div>
  );
}
