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

export function UserProfile() {
  const router = useRouter();
  const { tenant } = useAuth();
  const { getFirebaseAuth } = useFirebaseAuth(clientConfig);
  const [hasLoggedOut, setHasLoggedOut] = React.useState(false);
  const [handleLogout, isLogoutLoading] = useLoadingCallback(async () => {
    const auth = await getFirebaseAuth();
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    setHasLoggedOut(true);
    await fetch("/api/logout", {
      method: "GET",
    });
    window.location.reload();
  });

  const [handleRefresh, isRefreshLoading] = useLoadingCallback(async () => {
    if (!tenant) {
      return;
    }

    await fetch("/api/refresh-tokens", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tenant.idToken}`,
      },
    });
  });

  const [handleClaims, isClaimsLoading] = useLoadingCallback(async () => {
    if (!tenant) {
      return;
    }

    await fetch("/api/custom-claims", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tenant.idToken}`,
      },
    });
  });

  function handleRedirect() {
    router.push(
      `${clientConfig.redirectUrl}?redirect_url=${window.location.href}`
    );
  }

  if (!tenant && hasLoggedOut) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>
          You are being logged out... <LoadingIcon />
        </h3>
      </div>
    );
  }

  if (!tenant) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>You are logged in as</h3>
      <div className={styles.content}>
        <div className={styles.avatar}>
          {tenant.photoUrl && <img src={tenant.photoUrl} />}
        </div>
        <span>{tenant.email}</span>
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
          loading={isRefreshLoading}
          disabled={isRefreshLoading}
          onClick={handleRefresh}
        >
          Refresh tokens
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
