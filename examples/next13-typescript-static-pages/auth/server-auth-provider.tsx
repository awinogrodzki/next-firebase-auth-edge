import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { cookies } from "next/headers";
import { AuthProvider } from "./client-auth-provider";
import { serverConfig } from "../config/server-config";
import { Tokens } from "next-firebase-auth-edge/lib/auth";
import { Tenant } from "./types";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/tenant";

const mapTokensToTenant = ({ token, decodedToken }: Tokens): Tenant => {
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
    isAnonymous: !emailVerified,
    emailVerified: emailVerified ?? false,
    name: displayName ?? null,
    photoUrl: photoURL ?? null,
    idToken: token,
  };
};

export async function ServerAuthProvider({
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

  return <AuthProvider defaultTenant={tenant}>{children}</AuthProvider>;
}
