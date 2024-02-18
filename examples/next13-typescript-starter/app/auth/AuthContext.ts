import {createContext, useContext} from 'react';
import {UserInfo} from 'firebase/auth';
import {Claims} from 'next-firebase-auth-edge/lib/auth/claims';

export interface User extends Omit<UserInfo, 'providerId'> {
  emailVerified: boolean;
  customClaims: Claims;
  authTime: number;
}

export interface AuthContextValue {
  user: User | null;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null
});

export const useAuth = () => useContext(AuthContext);
