import "./globals.css";
import styles from "./layout.module.css";
import { Metadata } from "next";
import { User } from "../auth/AuthContext";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/claims";
import { Tokens, getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { authConfig } from "../config/server-config";
import { AuthProvider } from "../auth/AuthProvider";

const toUser = ({ decodedToken }: Tokens): User => {
  const {
    uid,
    email,
    picture: photoURL,
    email_verified: emailVerified,
    phone_number: phoneNumber,
    name: displayName,
  } = decodedToken;

  const customClaims = filterStandardClaims(decodedToken);

  return {
    uid,
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    phoneNumber: phoneNumber ?? null,
    emailVerified: emailVerified ?? false,
    customClaims,
  };
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tokens = await getTokens(cookies(), authConfig);
  const user = tokens ? toUser(tokens) : null;

  return (
    <html lang="en">
      <head />
      <body>
        <div className={styles.container}>
          <main className={styles.main}>
            <AuthProvider serverUser={user}>{children}</AuthProvider>
          </main>
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
