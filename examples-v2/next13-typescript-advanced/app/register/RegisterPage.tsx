"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFirebaseAuth } from "../../auth/firebase";
import { useLoadingCallback } from "react-loading-hook";
import { useAuth } from "../../auth/context";
import styles from "./register.module.css";
import { MainTitle } from "../../ui/MainTitle";
import { PasswordForm } from "../../ui/PasswordForm";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { PasswordFormValue } from "../../ui/PasswordForm/PasswordForm";
import { LoadingIcon } from "../../ui/icons";
import { Button } from "../../ui/Button";
import Link from "next/link";

export function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [hasLogged, setHasLogged] = React.useState(false);
  const { user } = useAuth();
  const { getFirebaseAuth } = useFirebaseAuth();
  const redirect = params?.get("redirect");
  const [registerWithEmailAndPassword, isRegisterLoading, error] =
    useLoadingCallback(async ({ email, password }: PasswordFormValue) => {
      setHasLogged(false);
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(credential.user);
      const idTokenResult = await credential.user.getIdTokenResult();
      await fetch("/api/login", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idTokenResult.token}`,
        },
      });
      setHasLogged(true);
      router.push(redirect ?? "/");
    });

  function getLoginUrl() {
    if (redirect) {
      return `/login?redirect=${redirect}`;
    }

    return "/login";
  }

  return (
    <div className={styles.page}>
      <MainTitle>Register page</MainTitle>
      {hasLogged && (
        <div className={styles.info}>
          <span>
            Redirecting to <strong>{params?.get("redirect") || "/"}</strong>
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
          <Link href={getLoginUrl()}>
            <Button disabled={isRegisterLoading}>Back to login</Button>
          </Link>
        </PasswordForm>
      )}
    </div>
  );
}
