import "./globals.css";
import { ServerAuthProvider } from "../auth/server-auth-provider";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
        {/* @ts-expect-error https://github.com/vercel/next.js/issues/43537 */}
        <ServerAuthProvider>{children}</ServerAuthProvider>
      </body>
    </html>
  );
}
