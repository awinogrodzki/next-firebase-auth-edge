"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoadingCallback } from "react-loading-hook";
import { getGoogleProvider, loginWithProvider } from "./firebase";
import styles from "./login.module.css";
import { Button } from "../../ui/Button";
import { LoadingIcon } from "../../ui/icons";
import Link from "next/link";
import { ButtonGroup } from "../../ui/ButtonGroup";
import { MainTitle } from "../../ui/MainTitle";
import { PasswordForm } from "../../ui/PasswordForm";
import { PasswordFormValue } from "../../ui/PasswordForm/PasswordForm";
import { signInWithEmailAndPassword } from "firebase/auth";
import { login } from "../../api";
import { getFirebaseAuth } from "../../auth/firebase";

export function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [hasLogged, setHasLogged] = React.useState(false);
  const redirect = params?.get("redirect");

  const [handleLoginWithEmailAndPassword, isEmailLoading, error] =
    useLoadingCallback(async ({ email, password }: PasswordFormValue) => {
      setHasLogged(false);
      const auth = getFirebaseAuth();

      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idTokenResult = await credential.user.getIdTokenResult();

      await login(idTokenResult.token);
      setHasLogged(true);
      router.push(redirect ?? "/");
    });

  const [handleLoginWithGoogle, isGoogleLoading] = useLoadingCallback(
    async () => {
      setHasLogged(false);
      const auth = getFirebaseAuth();
      const user = await loginWithProvider(auth, getGoogleProvider(auth));
      const idTokenResult = await user.getIdTokenResult();

      await login(idTokenResult.token);

      setHasLogged(true);
      router.push(redirect ?? "/");
    }
  );

  function passRedirectParam(url: string) {
    if (redirect) {
      return `${url}?redirect=${redirect}`;
    }

    return url;
  }

  return (
    <div className={styles.page}>
      <MainTitle>Login</MainTitle>
      {hasLogged && (
        <div className={styles.info}>
          <span>
            Redirecting to <strong>{redirect || "/"}</strong>
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
              href={passRedirectParam("/reset-password")}
            >
              Reset password
            </Link>
            <Link href={passRedirectParam("/register")}>
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
