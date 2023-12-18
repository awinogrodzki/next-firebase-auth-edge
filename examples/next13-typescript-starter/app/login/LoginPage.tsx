"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFirebaseAuth } from "../../auth/firebase";
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
import { getToken } from "@firebase/app-check";
import { getAppCheck } from "../../app-check";

export function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [hasLogged, setHasLogged] = React.useState(false);
  const { getFirebaseAuth } = useFirebaseAuth();
  const redirect = params?.get("redirect");

  const [handleLoginWithEmailAndPassword, isEmailLoading, error] =
    useLoadingCallback(async ({ email, password }: PasswordFormValue) => {
      setHasLogged(false);
      const auth = getFirebaseAuth();
      const appCheckTokenResponse = await getToken(getAppCheck(), false);

      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idTokenResult = await credential.user.getIdTokenResult();

      await fetch("/api/login", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idTokenResult.token}`,
          "X-Firebase-AppCheck": appCheckTokenResponse.token,
        },
      });
      setHasLogged(true);
      router.push(redirect ?? "/");
    });

  const [handleLoginWithGoogle, isGoogleLoading] = useLoadingCallback(
    async () => {
      setHasLogged(false);
      const auth = getFirebaseAuth();
      const appCheckTokenResponse = await getToken(getAppCheck(), false);
      const user = await loginWithProvider(auth, getGoogleProvider(auth));
      const idTokenResult = await user.getIdTokenResult();

      await fetch("/api/login", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idTokenResult.token}`,
          "X-Firebase-AppCheck": appCheckTokenResponse.token,
        },
      });
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
