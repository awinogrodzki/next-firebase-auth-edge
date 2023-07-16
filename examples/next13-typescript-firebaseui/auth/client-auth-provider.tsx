"use client";

import * as React from "react";
import { onIdTokenChanged, User as FirebaseUser } from "firebase/auth";
import { useFirebaseAuth } from "./firebase";
import { AuthContext, User } from "./context";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/tenant";

export interface AuthProviderProps {
  defaultUser: User | null;
  children: React.ReactNode;
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  defaultUser,
  children,
}) => {
  const { getFirebaseAuth } = useFirebaseAuth();
  const [user, setUser] = React.useState(defaultUser);

  const handleIdTokenChanged = async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    const idTokenResult = await firebaseUser.getIdTokenResult();
    await fetch("/api/login", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idTokenResult.token}`,
      },
    });
    setUser({
      ...firebaseUser,
      customClaims: filterStandardClaims(idTokenResult.claims),
    });
  };

  const registerChangeListener = async () => {
    const auth = getFirebaseAuth();
    return onIdTokenChanged(auth, handleIdTokenChanged);
  };

  React.useEffect(() => {
    const unsubscribePromise = registerChangeListener();

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
