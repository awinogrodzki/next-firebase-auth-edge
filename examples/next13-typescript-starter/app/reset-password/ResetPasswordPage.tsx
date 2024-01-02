"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useLoadingCallback } from "react-loading-hook";
import styles from "./ResetPasswordPage.module.css";
import { MainTitle } from "../../ui/MainTitle";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "../../ui/Button";
import Link from "next/link";
import { Input } from "../../ui/Input";
import { FormError } from "../../ui/FormError";
import { getFirebaseAuth } from "../../auth/firebase";

export function ResetPasswordPage() {
  const params = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [isSent, setIsSent] = React.useState(false);
  const redirect = params?.get("redirect");
  const [sendResetInstructions, loading, error] = useLoadingCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const auth = getFirebaseAuth();
      setIsSent(false);
      await sendPasswordResetEmail(auth, email);
      setEmail("");
      setIsSent(true);
    }
  );

  function getLoginUrl() {
    if (redirect) {
      return `/login?redirect=${redirect}`;
    }

    return "/login";
  }

  return (
    <div className={styles.page}>
      <MainTitle>Reset password</MainTitle>
      <form onSubmit={sendResetInstructions} className={styles.form}>
        <Input
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          type="email"
          placeholder="Email address"
        />
        {isSent && (
          <p className={styles.info}>Instructions sent. Check your email.</p>
        )}
        {error && <FormError>{error?.message}</FormError>}
        <Button
          loading={loading}
          disabled={loading}
          variant="contained"
          type="submit"
        >
          Send reset instructions
        </Button>
        <Link href={getLoginUrl()}>
          <Button disabled={loading}>Back to login</Button>
        </Link>
      </form>
    </div>
  );
}
