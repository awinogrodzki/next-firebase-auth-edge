'use client';

import { createContext } from 'react';
import { Tenant } from './types';

export interface AuthContextValue {
  tenant: Tenant | null;
}

export const AuthContext = createContext<AuthContextValue>({
  tenant: null,
});

