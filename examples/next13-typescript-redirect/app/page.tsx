"use client";

import Image from "next/image";
import styles from "./page.module.css";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clientConfig } from "./client-config";

const COUNTDOWN_SECONDS = 5;

export default function Home() {
  const [seconds, setSeconds] = React.useState(COUNTDOWN_SECONDS);
  const params = useSearchParams();
  const router = useRouter();
  const redirectUrl = params.get("redirect_url");
  const timeoutIdRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    setSeconds(COUNTDOWN_SECONDS);

    if (!redirectUrl) {
      return;
    }

    let start: number | undefined = undefined;
    function handler() {
      if (
        !redirectUrl ||
        new URL(redirectUrl).host !== clientConfig.redirectHost
      ) {
        throw new Error("Host not allowed");
      }

      router.push(redirectUrl);
    }

    timeoutIdRef.current = setTimeout(handler, COUNTDOWN_SECONDS * 1000);

    function callback(step: number) {
      if (start === undefined) {
        start = step;
      }

      const elapsed = step - start;
      const seconds = Math.max(
        Math.ceil(COUNTDOWN_SECONDS - elapsed / 1000),
        0
      );
      setSeconds(seconds);

      if (seconds > 0) {
        window.requestAnimationFrame(callback);
      }
    }

    const handle = window.requestAnimationFrame(callback);

    return () => {
      clearTimeout(timeoutIdRef.current);
      window.cancelAnimationFrame(handle);
    };
  }, [redirectUrl]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js 13!</a>
        </h1>
        {redirectUrl && (
          <p className={styles.description}>
            Redirecting to <code>{redirectUrl}</code> in {seconds} seconds...
          </p>
        )}
      </main>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
