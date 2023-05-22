import "./globals.css";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { cookies } from "next/headers";
import { AuthProvider } from "./auth-provider";
import { serverConfig } from "./server-config";
import { Tokens } from "next-firebase-auth-edge/lib/auth";
import { Tenant } from "../auth/types";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/tenant";

const mapTokensToTenant = ({ decodedToken }: Tokens): Tenant => {
  const customClaims = filterStandardClaims(decodedToken);

  const {
    uid,
    email,
    email_verified: emailVerified,
    picture: photoURL,
    name: displayName,
  } = decodedToken;

  return {
    id: uid,
    email: email ?? null,
    customClaims,
    emailVerified: emailVerified ?? false,
    name: displayName ?? null,
    photoUrl: photoURL ?? null,
  };
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tokens = await getTokens(cookies(), {
    serviceAccount: serverConfig.serviceAccount,
    apiKey: serverConfig.firebaseApiKey,
    cookieName: "AuthToken",
    cookieSignatureKeys: ["secret1", "secret2"],
  });

  const tenant = tokens ? mapTokensToTenant(tokens) : null;

  console.log("ROOT LAYOUT TOKENS", { tokens, tenant });

  return (
    <html lang="en">
      <head />
      <body>
        <AuthProvider defaultTenant={tenant}>{children}</AuthProvider>
      </body>
    </html>
  );
}
