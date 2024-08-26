import './globals.css';
import styles from './layout.module.css';
import {Metadata} from 'next';
import {getTokens} from 'next-firebase-auth-edge';
import {cookies, headers} from 'next/headers';
import {authConfig} from '../config/server-config';
import {AuthProvider} from './auth/AuthProvider';
import {toUser} from './shared/user';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const tokens = await getTokens(cookies(), {
    ...authConfig,
    headers: headers()
  });
  const user = tokens ? toUser(tokens) : null;

  return (
    <html lang="en">
      <head />
      <body>
        <div className={styles.container}>
          <main className={styles.main}>
            <AuthProvider user={user}>{children}</AuthProvider>
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
  title: 'next-firebase-auth-edge example page',
  description: 'Next.js page showcasing next-firebase-auth-edge features',
  icons: '/favicon.ico'
};
