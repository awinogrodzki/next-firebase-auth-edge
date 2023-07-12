"use client";

import * as React from "react";
import { useAuth } from "../../auth/hooks";
import styles from "./UserProfile.module.css";
import { useFirebaseAuth } from "../../auth/firebase";
import { useLoadingCallback } from "react-loading-hook";
import { clientConfig } from "../../config/client-config";
import { Button } from "../../ui/button";
import { LoadingIcon } from "../../ui/icons";
import { useRouter } from "next/navigation";
import { addToCounter } from "../actions/user-counters";
import { signOut } from "firebase/auth";

export function UserProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const { getFirebaseAuth } = useFirebaseAuth();
  const [hasLoggedOut, setHasLoggedOut] = React.useState(false);
  const [handleLogout, isLogoutLoading] = useLoadingCallback(async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
    setHasLoggedOut(true);
    await fetch("/api/logout", {
      method: "GET",
    });
    window.location.reload();
  });

  const [handleClaims, isClaimsLoading] = useLoadingCallback(async () => {
    await fetch("/api/custom-claims", {
      method: "POST",
    });
  });

  const [handleUserCounter, isUserCounterLoading] = useLoadingCallback(
    async () => {
      await fetch("/api/user-counters", {
        method: "POST",
      });
    }
  );

  function handleRedirect() {
    router.push(
      `${clientConfig.redirectUrl}?redirect_url=${window.location.href}`
    );
  }

  let [handleUserCounterAction, startTransition] = React.useTransition();

  const handleTransaction = () => {
    async function transitionWrapper() {
      await addToCounter();
    }
    transitionWrapper();
  };

  if (!user && hasLoggedOut) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>
          You are being logged out... <LoadingIcon />
        </h3>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>You are logged in as</h3>
      <div className={styles.content}>
        <div className={styles.avatar}>
          {user.photoURL && <img src={user.photoURL} />}
        </div>
        <span>{user.email}</span>
      </div>
      <div className={styles.buttonGroup}>
        <Button
          loading={isClaimsLoading}
          disabled={isClaimsLoading}
          onClick={handleClaims}
        >
          Set custom user claims
        </Button>
        <Button
          loading={isUserCounterLoading}
          disabled={isUserCounterLoading}
          onClick={handleUserCounter}
        >
          Update user counter in database
        </Button>
        <Button
          loading={handleUserCounterAction}
          disabled={handleUserCounterAction}
          onClick={() => startTransition(() => handleTransaction())}
        >
          Update user counter w/ server action
        </Button>
        <Button
          loading={isLogoutLoading}
          disabled={isLogoutLoading}
          onClick={handleLogout}
        >
          Log out
        </Button>
        <Button onClick={handleRedirect}>Redirect</Button>
      </div>
    </div>
  );
}
