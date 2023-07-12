"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFirebaseAuth } from "../../auth/firebase";
import { useLoadingCallback } from "react-loading-hook";
import { getGoogleProvider, loginWithProvider } from "./firebase";
import { useAuth } from "../../auth/context";
import styles from "./login.module.css";
import { Button } from "../../ui/Button";
import { LoadingIcon } from "../../ui/icons";
import Link from "next/link";
import { ButtonGroup } from "../../ui/ButtonGroup";
import { MainTitle } from "../../ui/MainTitle";

export function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [hasLogged, setHasLogged] = React.useState(false);
  const { user } = useAuth();
  const { getFirebaseAuth } = useFirebaseAuth();
  const [handleLoginWithGoogle, isGoogleLoading] = useLoadingCallback(
    async () => {
      setHasLogged(false);
      const auth = getFirebaseAuth();
      const user = await loginWithProvider(auth, getGoogleProvider(auth));
      const idTokenResult = await user.getIdTokenResult();
      await fetch("/api/login", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idTokenResult.token}`,
        },
      });
      setHasLogged(true);
      const redirect = params?.get("redirect");
      router.push(redirect ?? "/");
    }
  );

  return (
    <div className={styles.page}>
      <MainTitle>Login page</MainTitle>
      {!user && !isGoogleLoading && !hasLogged && (
        <div className={styles.info}>
          <span>No user found. Singing in as anonymous...</span>
          <LoadingIcon />
        </div>
      )}
      {!hasLogged && (
        <ButtonGroup>
          <Link href="/register">
            <Button>Register</Button>
          </Link>
          <Button
            loading={isGoogleLoading}
            disabled={isGoogleLoading || !user}
            onClick={handleLoginWithGoogle}
          >
            Log in with Google
          </Button>
        </ButtonGroup>
      )}
      {hasLogged && (
        <div className={styles.info}>
          <span>
            Redirecting to <strong>{params?.get("redirect") || "/"}</strong>
          </span>
          <LoadingIcon />
        </div>
      )}
    </div>
  );
}
