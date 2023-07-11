import styles from "./page.module.css";
import { Button } from "../../ui/button";
import Link from "next/link";
import { ServerAuthProvider } from "../../auth/server-auth-provider";
import { UserProfile } from "../UserProfile";
import { Metadata } from "next";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { cookies } from "next/headers";
import { authConfig } from "../../config/server-config";

export default function Profile() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/">
          <Button>Go back to home page</Button>
        </Link>
      </nav>
      <h1 className={styles.title}>Profile page</h1>
      <p className={styles.description}>This page is server-side rendered</p>
      {/* @ts-expect-error https://github.com/vercel/next.js/issues/43537 */}
      <ServerAuthProvider>
        <UserProfile />
      </ServerAuthProvider>
    </div>
  );
}

// Generate customized metadata based on user cookies
// https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export async function generateMetadata(): Promise<Metadata> {
  const tokens = await getTokens(cookies(), authConfig);

  if (!tokens) {
    return {};
  }

  return {
    title: `${tokens.decodedToken.email} profile page | next-firebase-auth-edge example`,
  };
}
