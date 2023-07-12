"use client";

import * as React from "react";
import { useAuth } from "../../../auth/context";
import styles from "./UserProfile.module.css";
import { useFirebaseAuth } from "../../../auth/firebase";
import { useLoadingCallback } from "react-loading-hook";
import { clientConfig } from "../../../config/client-config";
import { Button } from "../../../ui/Button";
import { LoadingIcon } from "../../../ui/icons";
import { useRouter } from "next/navigation";
import { incrementCounter } from "../../actions/user-counters";
import { signOut } from "firebase/auth";
import { ButtonGroup } from "../../../ui/ButtonGroup";
import { Card } from "../../../ui/Card";

interface UserProfileProps {
  serverCount: number;
}

export function UserProfile({ serverCount }: UserProfileProps) {
  const [apiCount, setApiCount] = React.useState(serverCount);
  // serverCount is updated with Server Actions
  // apiCount is updated using API endpoint
  const count = serverCount > apiCount ? serverCount : apiCount;
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

  const [handleIncrementCounterApi, isIncrementCounterApiLoading] =
    useLoadingCallback(async () => {
      const response = await fetch("/api/user-counters", {
        method: "POST",
      });

      const { count } = await response.json();
      setApiCount(count);
    });

  function handleRedirect() {
    router.push(
      `${clientConfig.redirectUrl}?redirect_url=${window.location.href}`
    );
  }

  let [isIncrementCounterActionPending, startTransition] =
    React.useTransition();

  if (!user && hasLoggedOut) {
    return (
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.title}>
            <span>You are being logged out...</span>
            <LoadingIcon />
          </h3>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Card className={styles.section}>
        <h3 className={styles.title}>You are logged in as</h3>
        <div className={styles.content}>
          <div className={styles.avatar}>
            {user.photoURL && <img src={user.photoURL} />}
          </div>
          <span>{user.email}</span>
        </div>
        <ButtonGroup>
          <Button
            loading={isClaimsLoading}
            disabled={isClaimsLoading}
            onClick={handleClaims}
          >
            Set custom user claims
          </Button>
          <Button
            loading={isLogoutLoading}
            disabled={isLogoutLoading}
            onClick={handleLogout}
          >
            Log out
          </Button>
          <Button onClick={handleRedirect}>Redirect</Button>
        </ButtonGroup>
      </Card>
      <Card className={styles.section}>
        <h3 className={styles.title}>
          {/* defaultCount is updated by server */}
          Counter: {count}
        </h3>
        <ButtonGroup>
          <Button
            loading={isIncrementCounterApiLoading}
            disabled={
              isIncrementCounterApiLoading || isIncrementCounterActionPending
            }
            onClick={handleIncrementCounterApi}
          >
            Update user counter w/ api endpoint
          </Button>
          <Button
            loading={isIncrementCounterActionPending}
            disabled={
              isIncrementCounterActionPending || isIncrementCounterApiLoading
            }
            onClick={() =>
              startTransition(() => incrementCounter() as unknown as void)
            }
          >
            Update user counter w/ server action
          </Button>
        </ButtonGroup>
      </Card>
    </div>
  );
}
