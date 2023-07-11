// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { serverConfig } from "../../config/server-config";
import { refreshAuthCookies } from "next-firebase-auth-edge/lib/next/cookies";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const bearerToken = req.headers["authorization"]?.split(" ")[1] ?? "";
  const { idToken, refreshToken } = await refreshAuthCookies(bearerToken, res, {
    serviceAccount: serverConfig.serviceAccount,
    apiKey: serverConfig.firebaseApiKey,
    cookieName: "AuthToken",
    cookieSignatureKeys: ["secret1", "secret2"],
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: false, // Set this to true on HTTPS environments
      sameSite: "strict" as const,
      maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
    },
  });

  res.status(200).json({ bearerToken, idToken, refreshToken });
}
