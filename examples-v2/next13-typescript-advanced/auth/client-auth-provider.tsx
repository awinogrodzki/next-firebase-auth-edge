"use client";

import * as React from "react";
import type { User, UserInfo } from "firebase/auth";
import { useFirebaseAuth } from "./firebase";
import { clientConfig } from "../config/client-config";
import { AuthContext } from "./context";
import { onIdTokenChanged, signInAnonymously } from "firebase/auth";

export interface AuthProviderProps {
  defaultUser: UserInfo | null;
  children: React.ReactNode;
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  defaultUser,
  children,
}) => {
  const { getFirebaseAuth } = useFirebaseAuth(clientConfig);
  const firstLoadRef = React.useRef(true);
  const [user, setUser] = React.useState(defaultUser);

  const handleIdTokenChanged = async (firebaseUser: User | null) => {
    if (firebaseUser && user && firebaseUser.uid === user.uid) {
      firstLoadRef.current = false;
      return;
    }

    const auth = await getFirebaseAuth();

    if (!firebaseUser && firstLoadRef.current) {
      firstLoadRef.current = false;
      const credential = await signInAnonymously(auth);
      await fetch("/api/login", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${
            (
              await credential.user.getIdTokenResult()
            ).token
          }`,
        },
      });
      return;
    }

    if (!firebaseUser) {
      firstLoadRef.current = false;
      setUser(null);
      return;
    }

    firstLoadRef.current = false;
    setUser(firebaseUser);
  };

  const registerChangeListener = async () => {
    const auth = await getFirebaseAuth();
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
