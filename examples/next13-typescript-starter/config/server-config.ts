import { GetTokensOptions } from "next-firebase-auth-edge/lib/next/tokens";
import { SetAuthCookiesOptions } from "next-firebase-auth-edge/lib/next/cookies";

export const serverConfig = {
  useSecureCookies: process.env.USE_SECURE_COOKIES === "true",
  firebaseApiKey: process.env.FIREBASE_API_KEY!,
  serviceAccount: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n")!,
  } : undefined,
};

export const authConfig: GetTokensOptions & SetAuthCookiesOptions = {
  apiKey: serverConfig.firebaseApiKey,
  cookieName: "AuthToken",
  cookieSignatureKeys: ["secret1", "secret2"],
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: serverConfig.useSecureCookies, // Set this to true on HTTPS environments
    sameSite: "lax" as const,
    maxAge: 12 * 60 * 60 * 24, // twelve days
  },
  serviceAccount: serverConfig.serviceAccount,
  UNSAFE_expireTokenOnInvalidKidHeader: true
};
