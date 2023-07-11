import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { authConfig } from "../../../config/server-config";
import { getFirestore } from "firebase-admin/firestore";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";

const initializeApp = () => {
  return admin.initializeApp({
    credential: admin.credential.cert(authConfig.serviceAccount),
  });
};

const getFirebaseAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  // admin.firestore.setLogFunction(console.log);

  return initializeApp();
};

export async function POST(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

  if (!tokens) {
    throw new Error("Cannot update counter of unauthenticated user");
  }

  const db = getFirestore(getFirebaseAdminApp());
  const snapshot = await db
    .collection("user-counters")
    .doc(tokens.decodedToken.uid)
    .get();

  const currentUserCounter = await snapshot.data();

  if (!snapshot.exists || !currentUserCounter) {
    const userCounter = {
      id: tokens.decodedToken.uid,
      count: 1,
    };

    await snapshot.ref.create(userCounter);
    return NextResponse.json(userCounter);
  }

  const newUserCounter = {
    ...currentUserCounter,
    count: currentUserCounter.count + 1,
  };
  await snapshot.ref.update(newUserCounter);

  return NextResponse.json(newUserCounter);
}
