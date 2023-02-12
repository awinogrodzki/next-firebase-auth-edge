import styles from "./page.module.css";
import { Button } from "../../ui/button";
import Link from "next/link";
import { ServerAuthProvider } from "../../auth/server-auth-provider";
import { UserProfile } from "../UserProfile";

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
