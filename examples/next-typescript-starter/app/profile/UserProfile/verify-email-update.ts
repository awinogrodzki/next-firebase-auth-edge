'use server'

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { refreshServerCookies } from "next-firebase-auth-edge/lib/next/cookies";
import { applyActionCode, checkActionCode, sendEmailVerification } from "firebase/auth";
import { getTokens } from "next-firebase-auth-edge";
import { getFirebaseAuth } from "../../auth/firebase";
import { authConfig } from "../../../config/server-config";

export const verifyEmailUpdate = async (code: string) => {
  if (!code) throw new Error("No code provided");

  const res = await checkActionCode(getFirebaseAuth(), code);

  if (!res.data.email && !res.data.previousEmail)
    throw new Error("Wrong action code for this operation");

  await applyActionCode(getFirebaseAuth(), code);

  const auth = await getTokens(cookies(), authConfig);
  if (!auth) return redirect("/sign-in");
  else {
    await refreshServerCookies(
      cookies(),
      // https://github.com/vercel/next.js/discussions/63236
      new Headers(headers()),
      authConfig
    );
    return true;
  }
};