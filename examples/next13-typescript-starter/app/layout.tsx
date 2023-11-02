import "./globals.css";
import styles from "./layout.module.css";
import { Metadata } from "next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <div className={styles.container}>
          <main className={styles.main}>{children}</main>
          <footer className={styles.footer}>
            <a
              href="https://github.com/awinogrodzki/next-firebase-auth-edge"
              target="_blank"
            >
              github.com/awinogrodzki/next-firebase-auth-edge
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "next-firebase-auth-edge example page",
  description: "Next.js page showcasing next-firebase-auth-edge features",
  icons: "/favicon.ico",
};
