"use client";

import * as React from "react";
import {
  IdTokenResult,
  onIdTokenChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/claims";
import { AuthContext, User } from "./AuthContext";
import { getFirebaseAuth } from "./firebase";
import { login, logout } from "../../api";

export interface AuthProviderProps {
  serverUser: User | null;
  children: React.ReactNode;
}

function toUser(user: FirebaseUser, idTokenResult: IdTokenResult): User {
  return {
    ...user,
    customClaims: filterStandardClaims(idTokenResult.claims),
  };
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  serverUser,
  children,
}) => {
  const [user, setUser] = React.useState(serverUser);

  const handleIdTokenChanged = async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const tokenResult = await firebaseUser.getIdTokenResult();

      await login(tokenResult.token);
      setUser(toUser(firebaseUser, tokenResult));
      return;
    }

    await logout();
    setUser(null);
  };

  React.useEffect(() => {
    return onIdTokenChanged(getFirebaseAuth(), handleIdTokenChanged);
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
