"use client";

import { createContext } from "react";
import type { UserInfo } from "firebase/auth";

export interface AuthContextValue {
  user: UserInfo | null;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
});
