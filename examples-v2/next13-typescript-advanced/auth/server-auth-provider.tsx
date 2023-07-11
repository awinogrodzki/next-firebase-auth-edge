import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { cookies } from "next/headers";
import { AuthProvider } from "./client-auth-provider";
import { authConfig } from "../config/server-config";
import { Tokens } from "next-firebase-auth-edge/lib/auth";
import type { UserInfo } from "firebase/auth";

const mapTokensToUser = ({ decodedToken }: Tokens): UserInfo => {
  const {
    uid,
    email,
    email_verified: emailVerified,
    picture: photoURL,
    phone_number: phoneNumber,
    name: displayName,
  } = decodedToken;

  return {
    uid,
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    phoneNumber: phoneNumber ?? null,
    providerId: "firebase",
  };
};

export async function ServerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const tokens = await getTokens(cookies(), authConfig);
  const user = tokens ? mapTokensToUser(tokens) : null;

  return <AuthProvider defaultUser={user}>{children}</AuthProvider>;
}
