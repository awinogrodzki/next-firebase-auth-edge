'use client';

import * as React from 'react';
import {
  IdTokenResult,
  onIdTokenChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {filterStandardClaims} from 'next-firebase-auth-edge/lib/auth/claims';
import {AuthContext, User} from './AuthContext';
import {getFirebaseAuth} from './firebase';
import {login, logout} from '../../api';

export interface AuthProviderProps {
  serverUser: User | null;
  children: React.ReactNode;
}

function toUser(user: FirebaseUser, idTokenResult: IdTokenResult): User {
  return {
    ...user,
    emailVerified:
      user.emailVerified || (idTokenResult.claims.email_verified as boolean),
    customClaims: filterStandardClaims(idTokenResult.claims),
    authTime: toAuthTime(idTokenResult.issuedAtTime)
  };
}

function toAuthTime(date: string) {
  return new Date(date).getTime() / 1000;
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  serverUser,
  children
}) => {
  const [user, setUser] = React.useState(serverUser);
  const [hasLoaded, setHasLoaded] = React.useState(false);

  React.useEffect(() => {
    if (user === serverUser) {
      return;
    }

    setUser(serverUser);
  }, [serverUser]);

  const handleLogout = async () => {
    if (!user) {
      return;
    }

    await logout();
    window.location.reload();
  };

  const handleLogin = async (firebaseUser: FirebaseUser) => {
    const idTokenResult = await firebaseUser.getIdTokenResult();

    if (
      user?.authTime &&
      user.authTime >= toAuthTime(idTokenResult.issuedAtTime)
    ) {
      return;
    }

    await login(idTokenResult.token);
    setUser(toUser(firebaseUser, idTokenResult));
  };

  const handleIdTokenChanged = async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      await handleLogout();
      setHasLoaded(true);
      return;
    }

    await handleLogin(firebaseUser);
    setHasLoaded(true);
  };

  React.useEffect(() => {
    return onIdTokenChanged(getFirebaseAuth(), handleIdTokenChanged);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        hasLoaded
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
