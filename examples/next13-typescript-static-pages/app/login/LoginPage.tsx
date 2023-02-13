"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFirebaseAuth } from "../../auth/firebase";
import { clientConfig } from "../../config/client-config";
import { useLoadingCallback } from "react-loading-hook";
import { getGoogleProvider, loginWithProvider } from "./firebase";
import { useAuth } from "../../auth/hooks";
import styles from "./login.module.css";

export function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { tenant } = useAuth();
  const { getFirebaseAuth } = useFirebaseAuth(clientConfig);
  const [handleLoginWithGoogle, isLoading] = useLoadingCallback(async () => {
    const { GoogleAuthProvider } = await import("firebase/auth");
    const auth = await getFirebaseAuth();
    await loginWithProvider(
      auth,
      await getGoogleProvider(auth),
      GoogleAuthProvider.credentialFromError
    );
  });

  React.useEffect(() => {
    const redirect = params.get("redirect");

    if (tenant && !tenant.isAnonymous) {
      router.push(redirect ?? "/");
    }
  }, [tenant?.isAnonymous]);

  return (
    <div className={styles.page}>
      <h2>next-firebase-auth-edge example login page</h2>
      <button
        className={styles.button}
        disabled={isLoading}
        onClick={handleLoginWithGoogle}
      >
        Log in with Google
      </button>
    </div>
  );
}
