"use server";

import { getFirestore } from "firebase-admin/firestore";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getFirebaseAdminApp } from "../firebase";
import { authConfig } from "../../config/server-config";

export async function incrementCounter() {
  const tokens = await getTokens(cookies(), authConfig);

  if (!tokens) {
    throw new Error("Cannot update counter of unauthenticated user");
  }

  const db = getFirestore(getFirebaseAdminApp());
  const snapshot = await db
    .collection("user-counters")
    .doc(tokens.decodedToken.uid)
    .get();

  const currentUserCounter = snapshot.data();

  if (!snapshot.exists || !currentUserCounter) {
    const userCounter = {
      id: tokens.decodedToken.uid,
      count: 1,
    };

    await snapshot.ref.create(userCounter);
  }

  const newUserCounter = {
    ...currentUserCounter,
    count: currentUserCounter?.count + 1,
  };
  await snapshot.ref.update(newUserCounter);

  revalidatePath("/");
}
