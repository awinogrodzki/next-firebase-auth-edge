import styles from "./page.module.css";
import Link from "next/link";
import { Button } from "../ui/button";

export async function generateStaticParams() {
  return [{}];
}

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Welcome to <a href="https://nextjs.org">Next.js 13!</a>
      </h1>
      <p className={styles.description}>This page is static</p>
      <div className={styles.card}>
        <Link href="/profile">
          <h2>You are logged in</h2>
          <Button style={{ marginBottom: 0 }}>Go to profile page</Button>
        </Link>
      </div>
    </div>
  );
}
